---
id: high-performance-protoc-replacement
title: High-Performance protoc Replacement
---

> We highly recommend using the [generate](../generate/usage.md) command for all of your Protobuf
> generation needs. However, there are cases where `buf protoc` is useful, such as integrating `buf`
> into [Bazel](https://bazel.build).

`buf` provides a modern, high-performance, drop-in replacement for `protoc` that uses
`buf`'s [internal compiler](../build/internal-compiler.md). When we say high-performance,
we mean a 7.5x real-world improvement on a modern personal computer:

```sh
$ git remote -v
origin    https://github.com/googleapis/googleapis (fetch)
origin    https://github.com/googleapis/googleapis (push)

$ find . -name '*.proto' | wc -l
    3064

$ time protoc -I . -o /dev/null $(find . -name '*.proto') 2>/dev/null

real    0m6.025s
user    0m5.104s
sys    0m0.348s

$ time buf protoc -I . -o /dev/null $(find . -name '*.proto') 2>/dev/null

real    0m0.799s
user    0m6.176s
sys    0m0.764s
```

This compiler is constantly integration tested against thousands of Protobuf files to
verify that equivalent [FileDescriptorSets](https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/descriptor.proto)
are produced, and we have used it in production ourselves for over a year now.

All flags and features of `protoc` are supported and compatible, with
the following exceptions:

- `--encode`
- `--decode`
- `--decode_raw`
- `--descriptor_set_in`

The remaining flags can all be added if there is sufficient demand.

Additionally, we have added the flag `--by-dir` flag which causes `buf protoc` to run your
protoc plugins in parallel on a per-directory basis, resulting in major further performance
improvements.

We are providing `buf protoc` as a mechanism for users to get into the Buf ecosystem
with drop-in compatibility, and encourage you to try it out with your existing Protobuf
workflows!
