import { z } from "astro/zod";

export const Literal = z.union([z.string(), z.number(), z.boolean()]);
export type Literal = z.infer<typeof Literal>;

export const StringOrArray = z
  .string()
  .or(z.array(z.string()))
  .transform(value => (Array.isArray(value) ? value : [value]));

export const File = z
  .tuple([z.string()])
  .or(z.tuple([z.string(), z.object({ target: z.string() })]));

/**
 * Relative path to an .app that should be moved into the `/Applications`
 * folder on installation.
 */
export const AppArtifact = z
  .object({
    app: File,
  })
  .transform(({ app }) => ({
    type: "app" as const,
    value: {
      name: app[0],
      target: app[1]?.target,
    },
  }));
export type AppArtifact = z.infer<typeof AppArtifact>;

/**
 * Relative path to a containing directory that should be moved into the `/Applications`
 * folder on installation.
 */
export const SuiteArtifact = z
  .object({
    suite: File,
  })
  .transform(({ suite }) => ({
    type: "suite" as const,
    value: {
      name: suite[0],
      target: suite[1]?.target,
    },
  }));
export type SuiteArtifact = z.infer<typeof SuiteArtifact>;

/**
 * `PkgOptions` can be used to override a `.pkg`s default install options via `-applyChoiceChangesXML`.
 */
export const PkgChoices = z.object({
  choices: z
    .array(
      z.object({
        choiceIdentifier: z.string(),
        choiceAttribute: z.string(),
        attributeSetting: z.any(),
      }),
    )
    .optional(),
});
export type PkgChoices = z.infer<typeof PkgChoices>;

/**
 * Tuple containing the relative path to a `.pkg` file and optional `PkgChoices`.
 */
export const Pkg = z
  .string()
  .or(z.tuple([z.string()]))
  .or(z.tuple([z.string(), PkgChoices]))
  .transform(value => {
    if (typeof value === "string") {
      return {
        pkg: value,
        choices: undefined,
      };
    }
    if (value.length === 1) {
      return {
        pkg: value[0],
        choices: undefined,
      };
    } else {
      return {
        pkg: value[0],
        choices: value[1].choices,
      };
    }
  });
export type Pkg = z.infer<typeof Pkg>;

/**
 * Relative path to a `.pkg` file containing the distribution.
 */
export const PkgArtifact = z
  .object({
    pkg: Pkg,
  })
  .transform(({ pkg }) => ({
    type: "pkg" as const,
    value: {
      pkg: pkg.pkg,
      choices: pkg?.choices,
    },
  }));
export type PkgArtifact = z.infer<typeof PkgArtifact>;

export const Script = z.object({
  executable: z.string(),
  args: z.array(z.string()).optional(),
  input: Literal.or(z.array(Literal))
    .transform(value => (Array.isArray(value) ? value : [value]))
    .optional(),
  must_succeed: z.boolean().optional(),
  sudo: z.boolean().optional(),
  print_stderr: z.boolean().optional(),
});

/**
 * Describes an executable which must be run to complete the installation.
 */
export const InstallerArtifact = z
  .object({
    installer: z.array(
      z
        .object({
          script: Script,
        })
        .or(z.object({ manual: z.string() })),
    ),
  })
  .transform(({ installer }) => ({ type: "installer" as const, value: installer }));
export type InstallerArtifact = z.infer<typeof InstallerArtifact>;

/**
 * Relative path to a Binary that should be linked into the `$(brew --prefix)/bin` folder on installation.
 */
export const BinaryArtifact = z
  .object({
    binary: File,
  })
  .transform(({ binary }) => ({
    type: "binary" as const,
    value: binary[0],
  }));
export type BinaryArtifact = z.infer<typeof BinaryArtifact>;

/**
 * Relative path to a Man Page that should be linked into the respective man
 * page folder on installation, e.g. `/usr/local/share/man/man3` for `my_app.3`.
 */
export const ManpageArtifact = z
  .object({
    manpage: File,
  })
  .transform(({ manpage }) => ({
    type: "manpage" as const,
    value: manpage[0],
  }));
export type ManpageArtifact = z.infer<typeof ManpageArtifact>;

/**
 * Relative path to a ColorPicker plugin that should be moved into
 * the `~/Library/ColorPickers` folder on installation.
 */
export const ColorPickerArtifact = z
  .object({
    colorpicker: File,
  })
  .transform(({ colorpicker }) => ({
    type: "colorpicker" as const,
    value: colorpicker[0],
  }));
export type ColorPickerArtifact = z.infer<typeof ColorPickerArtifact>;

/**
 * Relative path to a Dictionary that should be moved into the `~/Library/Dictionaries` folder on installation.
 */
export const DictionaryArtifact = z
  .object({
    dictionary: File,
  })
  .transform(({ dictionary }) => ({
    type: "dictionary" as const,
    value: dictionary[0],
  }));
export type DictionaryArtifact = z.infer<typeof DictionaryArtifact>;

/**
 * Relative path to a Font that should be moved into the `~/Library/Fonts` folder on installation.
 */
export const FontArtifact = z
  .object({
    font: File,
  })
  .transform(({ font }) => ({
    type: "font" as const,
    value: font[0],
  }));
export type FontArtifact = z.infer<typeof FontArtifact>;

/**
 * Relative path to an Input Method that should be moved into the ~/Library/Input Methods folder on installation.
 */
export const InputMethodArtifact = z
  .object({
    input_method: File,
  })
  .transform(({ input_method }) => ({
    type: "input_method" as const,
    value: input_method[0],
  }));
export type InputMethodArtifact = z.infer<typeof InputMethodArtifact>;

/**
 * Relative path to an Internet Plugin that should be moved into the ~/Library/Internet Plug-Ins folder on installation.
 */
export const InternetPluginArtifact = z
  .object({
    internet_plugin: File,
  })
  .transform(({ internet_plugin }) => ({
    type: "internet_plugin" as const,
    value: internet_plugin[0],
  }));
export type InternetPluginArtifact = z.infer<typeof InternetPluginArtifact>;

/**
 * Relative path to a Keyboard Layout that should be moved into the /Library/Keyboard Layouts folder on installation.
 */
export const KeyboardLayoutArtifact = z
  .object({
    keyboard_layout: File,
  })
  .transform(({ keyboard_layout }) => ({
    type: "keyboard_layout" as const,
    value: keyboard_layout[0],
  }));
export type KeyboardLayoutArtifact = z.infer<typeof KeyboardLayoutArtifact>;

export const PrefPaneArtifact = z
  .object({
    prefpane: File,
  })
  .transform(({ prefpane }) => ({
    type: "prefpane" as const,
    value: prefpane[0],
  }));
export type PrefPaneArtifact = z.infer<typeof PrefPaneArtifact>;

export const QlPluginArtifact = z
  .object({
    qlplugin: File,
  })
  .transform(({ qlplugin }) => ({
    type: "qlplugin" as const,
    value: qlplugin[0],
  }));
export type QlPluginArtifact = z.infer<typeof QlPluginArtifact>;

export const MdImporterArtifact = z
  .object({
    mdimporter: File,
  })
  .transform(({ mdimporter }) => ({
    type: "mdimporter" as const,
    value: mdimporter[0],
  }));
export type MdImporterArtifact = z.infer<typeof MdImporterArtifact>;

export const ScreenSaverArtifact = z
  .object({
    screen_saver: File,
  })
  .transform(({ screen_saver }) => ({
    type: "screen_saver" as const,
    value: screen_saver[0],
  }));
export type ScreenSaverArtifact = z.infer<typeof ScreenSaverArtifact>;

export const ServiceArtifact = z
  .object({
    service: File,
  })
  .transform(({ service }) => ({
    type: "service" as const,
    value: service[0],
  }));
export type ServiceArtifact = z.infer<typeof ServiceArtifact>;

export const AudioUnitPluginArtifact = z
  .object({
    audio_unit_plugin: File,
  })
  .transform(({ audio_unit_plugin }) => ({
    type: "audio_unit_plugin" as const,
    value: audio_unit_plugin[0],
  }));
export type AudioUnitPluginArtifact = z.infer<typeof AudioUnitPluginArtifact>;

export const VstPluginArtifact = z
  .object({
    vst_plugin: File,
  })
  .transform(({ vst_plugin }) => ({
    type: "vst_plugin" as const,
    value: vst_plugin[0],
  }));
export type VstPluginArtifact = z.infer<typeof VstPluginArtifact>;

export const Vst3PluginArtifact = z
  .object({
    vst3_plugin: File,
  })
  .transform(({ vst3_plugin }) => ({
    type: "vst3_plugin" as const,
    value: vst3_plugin[0],
  }));
export type Vst3PluginArtifact = z.infer<typeof Vst3PluginArtifact>;

export const GenericArtifact = z
  .object({
    artifact: File,
  })
  .transform(({ artifact }) => ({
    type: "artifact" as const,
    value: artifact[0],
  }));
export type GenericArtifact = z.infer<typeof GenericArtifact>;

export const StageOnlyArtifact = z
  .object({
    stage_only: z.tuple([z.literal(true)]),
  })
  .transform(() => ({
    type: "stage_only" as const,
    value: true,
  }));
export type StageOnlyArtifact = z.infer<typeof StageOnlyArtifact>;

export const Signal = z.tuple([z.string(), z.string()]).transform(([signal, pid]) => ({
  signal,
  pid,
}));
export type Signal = z.infer<typeof Signal>;

export const Uninstall = z.union([
  z
    .object({ early_script: Script })
    .transform(({ early_script }) => ({ type: "early_script" as const, value: early_script })),
  z
    .object({ launchctl: StringOrArray })
    .transform(({ launchctl }) => ({ type: "launchctl" as const, value: launchctl })),
  z
    .object({ quit: StringOrArray })
    .transform(({ quit }) => ({ type: "quit" as const, value: quit })),
  z
    .object({
      signal: Signal.or(z.array(Signal)).transform(signal =>
        Array.isArray(signal) ? signal : [signal],
      ),
    })
    .transform(({ signal }) => ({ type: "signal" as const, value: signal })),
  z
    .object({ login_item: StringOrArray })
    .transform(({ login_item }) => ({ type: "login_item" as const, value: login_item })),
  z
    .object({ kext: StringOrArray })
    .transform(({ kext }) => ({ type: "kext" as const, value: kext })),
  z
    .object({
      script: Script.or(z.array(Script)).transform(script =>
        Array.isArray(script) ? script : [script],
      ),
    })
    .transform(({ script }) => ({ type: "script" as const, value: script })),
  z
    .object({ pkgutil: StringOrArray })
    .transform(({ pkgutil }) => ({ type: "pkgutil" as const, value: pkgutil })),
  z
    .object({ delete: StringOrArray })
    .transform(value => ({ type: "delete" as const, value: value["delete"] })),
  z
    .object({ rmdir: StringOrArray })
    .transform(({ rmdir }) => ({ type: "rmdir" as const, value: rmdir })),
  z
    .object({ trash: StringOrArray })
    .transform(({ trash }) => ({ type: "trash" as const, value: trash })),
]);

export const Artifact = z.union([
  AppArtifact,
  SuiteArtifact,
  PkgArtifact,
  InstallerArtifact,
  BinaryArtifact,
  ManpageArtifact,
  ColorPickerArtifact,
  DictionaryArtifact,
  FontArtifact,
  InputMethodArtifact,
  InternetPluginArtifact,
  KeyboardLayoutArtifact,
  PrefPaneArtifact,
  QlPluginArtifact,
  MdImporterArtifact,
  ScreenSaverArtifact,
  ServiceArtifact,
  AudioUnitPluginArtifact,
  VstPluginArtifact,
  Vst3PluginArtifact,
  GenericArtifact,
  StageOnlyArtifact,
  z
    .object({
      zap: z.array(Uninstall),
    })
    .transform(({ zap }) => ({ type: "zap" as const, value: zap })),
  z
    .object({
      uninstall: z.array(Uninstall),
    })
    .transform(({ uninstall }) => ({ type: "uninstall" as const, value: uninstall })),
  z
    .object({
      preflight: z.null(),
    })
    .transform(({ preflight }) => ({ type: "preflight" as const, value: preflight })),
  z
    .object({
      postflight: z.null(),
    })
    .transform(({ postflight }) => ({ type: "postflight" as const, value: postflight })),
  z
    .object({
      uninstall_preflight: z.null(),
    })
    .transform(({ uninstall_preflight }) => ({
      type: "uninstall_preflight" as const,
      value: uninstall_preflight,
    })),
  z
    .object({
      uninstall_postflight: z.null(),
    })
    .transform(({ uninstall_postflight }) => ({
      type: "uninstall_postflight" as const,
      value: uninstall_postflight,
    })),
]);
export type Artifact = z.infer<typeof Artifact>;

export const Container = z
  .object({
    nested: z.string(),
  })
  .or(
    z.object({
      type: z.enum([
        "air",
        "bz2",
        "cab",
        "dmg",
        "generic_unar",
        "gzip",
        "otf",
        "pkg",
        "rar",
        "seven_zip",
        "sit",
        "tar",
        "ttf",
        "xar",
        "zip",
        "naked",
      ]),
    }),
  );

export const Cask = z
  .object({
    token: z.string(),
    full_token: z.string(),
    old_tokens: z.array(z.string()),
    tap: z.string(),
    name: z.array(z.string()),
    desc: z.string().nullable(),
    homepage: z.string(),
    url: z.string().url(),
    url_specs: z.unknown(),
    version: z.string(),
    bundle_version: z.string().nullable(),
    bundle_short_version: z.string().nullable(),
    sha256: z.string(),
    artifacts: z.array(Artifact),
    caveats: z.string().nullable(),
    depends_on: z.unknown(),
    conflicts_with: z
      .object({
        cask: z.array(z.string()).optional(),
        formula: z.array(z.string()).optional(),
      })
      .nullable(),
    container: Container.nullable(),
    auto_updates: z.boolean().nullable(),
    deprecated: z.boolean(),
    deprecation_date: z.string().nullable(),
    deprecation_reason: z.string().nullable(),
    disabled: z.boolean(),
    disable_date: z.string().nullable(),
    disable_reason: z.string().nullable(),
    tap_git_head: z.string().nullable(),
    languages: z.array(z.string()),
    ruby_source_path: z.string(),
    ruby_source_checksum: z.object({
      sha256: z.string(),
    }),
    // Used in local installations
    variations: z.record(z.unknown()),
    installed: z.null(),
    installed_time: z.null(),
    outdated: z.literal(false),
    // Only from API
    generated_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    analytics: z.unknown(),
  })
  .strict();

export type Cask = z.infer<typeof Cask>;

export function caskToNix(cask: Cask) {
  const { token: pname, version, url, sha256, artifacts, desc: description, homepage } = cask;
  const urlObj = new URL(url);
  const pathSegments = urlObj.pathname.split("/");
  let filename = pathSegments[pathSegments.length - 1];
  if (filename === "") {
    filename = `${pname}-${version}`;
  }
  return {
    pname,
    version,
    artifacts,
    src: {
      url,
      sha256,
      name: filename,
    },
    meta: {
      description,
      homepage,
    },
  };
}
