# NixCasks

NixCasks is a tool that transforms [Homebrew][homebrew] casks (GUI applications) recipes into Nix derivations, enabling users to install Homebrew casks directly without `brew` being installed.

Visit [NixCasks website][website] for more info and list of packages

## Getting Started

NixCasks is a flake that exports compatible Homebrew cask through `packages.<system>.<package>`. NixCasks can be added to your flake via GitHub.

```nix
nix-casks = {
  url = "github:atahanyorganci/nix-casks/archive";
  inputs.nixpkgs.follows = "nixpkgs";
};
```

Installing packages is just adding it to `environment.systemPackages` for global and `users.user.<name>.packages ` for per user on nix-darwin and `home.packages` via HomeManager.

```nix
home.packages = with inputs.nix-casks.packages.${pkgs.system}; [
  raycast
  slack
  visual-studio-code
  whatsapp
  brave-browser
  vlc
];
```

## How it Works?

NixCasks parses the cask files mostly from [`https://formuale.brew.sh/api/cask.json`](https://formuale.brew.sh/api/cask.json) and converts into JSON file that can be used in Nix derivation. JSON file contains basic package info (name, version, description, etc.), package source (mostly `.dmg` and `.zip` files) and install steps.

NixCasks provides [`unpack.sh`](./packages/unpack.sh) that can extract applications from `.dmg` via `hdiutil` and other archive formats. Install steps are determined according to [Cask Cookbook][cask-cookbook], for example moving `/Name.app` to `$out/Applications/Name.app`. Lastly, the package is linked from Nix store to the system, symlinked applications become discoverable by other applications (i.e. Spotlight, Raycast, etc.) as NixCasks respects the MacOS directory structure.

> [!NOTE]
> NixCasks currently supports zip archives (`.zip` files) and disk images (`.dmg` files) in `unpackPhase`. Please contribute by creating an issue or PR with package name and source file format.

## `nix-casks` Website and API

Official [NixCasks website][website] provides full list of available packages and hosts API to update the package repository. OpenAPI spec is available at [`/api/openapi`][openapi] and Scalar API reference is available at [`/api/reference`][reference].

### Architecture

The website is server rendered Astro app hosted on Vercel. The tech stack is as follows.

- [Astro](https://astro.build/) for server-side rendering of mostly static pages
- [Drizzle](https://orm.drizzle.team/) for schema management and querying
- [TailwindCSS](https://tailwindcss.com/) for sane CSS
- [Neon Database](https://neon.tech/)
- [Upstash Qstash](https://upstash.com/) for securely invoking update workflow on CRON schedule
- [Tigris](https://www.tigrisdata.com) for storing package bundles and hosting archives
- [Vercel](https://vercel.com) for hosting
- [Cloudflare](https://cloudflare.com) for DNS and DDoS protection
- [GitHub Actions](https://docs.github.com/en/actions) for updating [`archive.json`](./archive.json) after scheduled package update

## Limitations

- `.pkg` files are unsupported, as it requires `sudo` privileges to be executed.
- Other archive formats may not be supported.

## Authors

- Atahan Yorgancı, [@atahanyorganci](https://github.com/atahanyorganci)

[website]: http://nix-casks.yorganci.dev
[openapi]: http://nix-casks.yorganci.dev/api/openapi.json
[reference]: http://nix-casks.yorganci.dev/api/reference
[homebrew]: https://brew.sh
[cask-cookbook]: https://docs.brew.sh/Cask-Cookbook
