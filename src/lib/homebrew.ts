import { z } from "astro/zod";

export const Literal = z.union([z.string(), z.number(), z.boolean()]);

export const StringOrArray = z
  .string()
  .or(z.array(z.string()))
  .transform(value => (Array.isArray(value) ? value : [value]));

export const File = z
  .tuple([z.string()])
  .or(z.tuple([z.string(), z.object({ target: z.string() })]));

export const FileArtifactType = z.enum([
  "app",
  "binary",
  "colorpicker",
  "dictionary",
  "font",
  "input_method",
  "internet_plugin",
  "keyboard_layout",
  "prefpane",
  "qlplugin",
  "mdimporter",
  "screen_saver",
  "service",
  "suite",
  "audio_unit_plugin",
  "vst_plugin",
  "vst3_plugin",
  "artifact",
]);

export const FileArtifact = z.record(FileArtifactType, File).transform(record =>
  Object.entries(record).map(([key, value]) => ({
    type: key,
    name: value[0],
    target: value[1]?.target,
  })),
);

export const Script = z
  .object({
    executable: z.string(),
    args: z.array(z.string()).default([]),
    input: Literal.or(z.array(Literal))
      .transform(value => (Array.isArray(value) ? value : [value]))
      .default([]),
    must_succeed: z.boolean().default(false),
    sudo: z.boolean().default(false),
    print_stderr: z.boolean().default(false),
  })
  .strict()
  .or(
    z.string().transform(value => ({
      executable: value,
      args: [],
      must_succeed: false,
      sudo: false,
      print_stderr: false,
    })),
  );

export const Signal = z.tuple([z.string(), z.string()]).transform(([signal, pid]) => ({
  signal,
  pid,
}));

export const PkgOptions = z.object({
  allow_untrusted: z.boolean().default(false),
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

export const Pkg = z
  .string()
  .or(z.tuple([z.string()]))
  .or(z.tuple([z.string(), PkgOptions]))
  .transform(value => {
    if (Array.isArray(value)) {
      if (value.length === 1) {
        return {
          pkg: value[0],
        };
      } else {
        return {
          pkg: value[0],
          ...value[1],
        };
      }
    } else {
      return {
        pkg: value,
      };
    }
  });

export const Uninstall = z.object({
  early_script: Script.optional(),
  launchctl: StringOrArray.optional(),
  quit: StringOrArray.optional(),
  signal: Signal.or(z.array(Signal))
    .transform(signal => (Array.isArray(signal) ? signal : [signal]))
    .optional(),
  login_item: StringOrArray.optional(),
  kext: StringOrArray.optional(),
  script: Script.or(z.array(Script))
    .transform(script => (Array.isArray(script) ? script : [script]))
    .optional(),
  pkgutil: StringOrArray.optional(),
  delete: StringOrArray.optional(),
  rmdir: StringOrArray.optional(),
  trash: StringOrArray.optional(),
});

export const Artifact = z.union([
  z.object({
    zap: z.array(Uninstall),
  }),
  z.object({
    uninstall: z.array(Uninstall),
  }),
  z.object({
    installer: z.array(
      z
        .object({
          script: Script,
        })
        .or(z.object({ manual: z.string() })),
    ),
  }),
  z.object({
    manpage: StringOrArray,
  }),
  z.object({
    pkg: Pkg,
  }),
  z.object({
    preflight: z.object({}).nullable(),
  }),
  z.object({
    postflight: z.object({}).nullable(),
  }),
  z.object({
    uninstall_preflight: z.object({}).nullable(),
  }),
  z.object({
    uninstall_postflight: z.object({}).nullable(),
  }),
  FileArtifact,
  z.object({
    stage_only: z.tuple([z.literal(true)]),
  }),
]);

const Artifacts = z.array(Artifact).transform(value => {
  const any = {} as any;
  for (const artifact of value) {
    for (const [key, value] of Object.entries(artifact)) {
      if (key in any) {
        any[key].push(value);
      } else {
        any[key] = [value];
      }
    }
  }
  return any;
});

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
  })
  .strict();

export type Cask = z.infer<typeof Cask>;
