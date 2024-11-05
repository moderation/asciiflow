workspace(
    name = "asciiflow"
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "aspect_rules_webpack",
    sha256 = "8079b1c2d08d026f5d1ec0308b194f07da617ebdb6d85f09b6e341a3a156203c",
    strip_prefix = "rules_webpack-0.16.0",
    url = "https://github.com/aspect-build/rules_webpack/releases/download/v0.16.0/rules_webpack-v0.16.0.tar.gz",
)

load("@aspect_rules_webpack//webpack:dependencies.bzl", "rules_webpack_dependencies")

rules_webpack_dependencies()
