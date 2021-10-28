---
id: generate-code
title: 5 Generate Code
---

`buf` provides a user friendly experience for local code generation that is completely compatible
with any existing usage of `protoc`.

Move back to the `start` directory with the following command:

```terminal
$ cd ..
```

## 5.1 Install Plugins {#install-plugins}

We'll be using the `protoc-gen-cpp` and `protoc-gen-java` plugins to generate code with `buf generate`,
so you'll need to install them.

These plugins are special, such that they are built-in to the `protoc` binary, so if you don't already
have `protoc` on your `$PATH`, please refer to the [installation guide](https://github.com/protocolbuffers/protobuf#protocol-compiler-installation).

> For other `protoc` plugins, such as `protoc-gen-go` and `protoc-gen-go-grpc`, it's **not** required to
> have `protoc` installed in your `$PATH`.

## 5.2 Configure a `buf.gen.yaml` {#configure-a-bufgenyaml}

The [`buf.gen.yaml`](../configuration/v1/buf-gen-yaml.md) file controls how the `buf generate` command
executes `protoc` plugins. With a `buf.gen.yaml`, you can configure where each `protoc` plugin writes its result,
as well as specify options for each plugin independently.

You can create a simple `buf.gen.yaml` file that configures the `protoc-gen-cpp` and `protoc-gen-java`
plugins with the following:

```yaml title="buf.gen.yaml"
version: v1
plugins:
  - name: cpp
    out: gen/proto/cpp
  - name: java
    out: gen/proto/java
```

In short, this configuration can be explained by the following:

 * Execute the `protoc-gen-cpp` plugin, and place its output in the `gen/proto/cpp` directory.
 * Execute the `protoc-gen-java` plugin, and place its output in the `gen/proto/java` directory.

Like `protoc`, `buf` infers the `protoc-gen-` prefix for each plugin specified by the `name` key.
You can override this behavior with the [path](../configuration/v1/buf-gen-yaml.md#path) key, but
this is an advanced feature that isn't often necessary.

## 5.3 Generate C++ and Java Stubs {#generate-c-and-java-stubs}

Now that we have a `buf.gen.yaml` with the `protoc-gen-{cpp,java}` plugins configured, we can generate the
C++ and Java code associated with the `PetStoreService` API.

Simply run the following command, targeting the input defined in the `petapis` directory:

```terminal
$ buf generate petapis
```

> If a `--template` is not explicitly specified, the `buf.gen.yaml` found in the current directory is used by
> default.

If successful, you'll notice a couple new files in the `gen/proto/cpp` and `gen/proto/java` directories (as
configured by the `buf.gen.yaml` created above):

```sh
start/
├── buf.gen.yaml
├── gen
│   └── proto
│       ├── cpp
│       │   ├── google
│       │   │   └── type
│       │   │       ├── datetime.pb.cc
│       │   │       └── datetime.pb.h
│       │   └── pet
│       │       └── v1
│       │           ├── pet.pb.cc
│       │           └── pet.pb.h
│       └── java
│           ├── com
│           │   └── google
│           │       └── type
│           │           ├── DateTime.java
│           │           ├── DateTimeOrBuilder.java
│           │           ├── DateTimeProto.java
│           │           ├── TimeZone.java
│           │           └── TimeZoneOrBuilder.java
│           └── pet
│               └── v1
│                   └── PetOuterClass.java
└── petapis
    ├── buf.yaml
    ├── google
    │   └── type
    │       └── datetime.proto
    └── pet
        └── v1
            └── pet.proto
```

## 5.4 Use Managed Mode {#use-managed-mode}

[Managed Mode](../generate/managed-mode.md) is a `buf.gen.yaml` configuration option that tells `buf`
to set all of the file options in your module according to an opinionated set of values suitable for each of the
supported Protobuf languages (e.g. Go, Java, C#, etc.). The file options are written *on the fly*
so that they never have to be written in the Protobuf source file itself.

These options have nothing to do with the API definition within Protobuf - it's an API
*consumer* concern, not an API *producer* concern. Different consumers may (and usually do)
want different values for these options, especially when a given set of Protobuf definitions
is consumed in many different places.

For example, we can explicitly configure a couple options to change the behavior of the
generated code for C++ and Java. We can disable [cc_enable_arenas](../configuration/v1/buf-gen-yaml.md#cc_enable_arenas)
and enable [java_multiple_files](../configuration/v1/buf-gen-yaml.md#java_multiple_files) with the
following configuration:

```yaml title=buf.gen.yaml {2-5}
 version: v1
+managed:
+  enabled: true
+  cc_enable_arenas: false
+  java_multiple_files: true
 plugins:
   - name: cpp
     out: gen/proto/cpp
   - name: java
     out: gen/proto/java
```

If we regenerate the C++ and Java code, you'll notice that the generated content has changed:

```terminal
$ rm -rf gen
$ buf generate petapis
```

```sh
start/
├── buf.gen.yaml
├── gen
│   └── proto
│       ├── cpp
│       │   ├── google
│       │   │   └── type
│       │   │       ├── datetime.pb.cc
│       │   │       └── datetime.pb.h
│       │   └── pet
│       │       └── v1
│       │           ├── pet.pb.cc
│       │           └── pet.pb.h
│       └── java
│           └── com
│               ├── google
│               │   └── type
│               │       ├── DateTime.java
│               │       ├── DateTimeOrBuilder.java
│               │       ├── DatetimeProto.java
│               │       ├── TimeZone.java
│               │       └── TimeZoneOrBuilder.java
│               └── pet
│                   └── v1
│                       ├── DeletePetRequest.java
│                       ├── DeletePetRequestOrBuilder.java
│                       ├── DeletePetResponse.java
│                       ├── DeletePetResponseOrBuilder.java
│                       ├── GetPetRequest.java
│                       ├── GetPetRequestOrBuilder.java
│                       ├── GetPetResponse.java
│                       ├── GetPetResponseOrBuilder.java
│                       ├── Pet.java
│                       ├── PetOrBuilder.java
│                       ├── PetProto.java
│                       ├── PetType.java
│                       ├── PutPetRequest.java
│                       ├── PutPetRequestOrBuilder.java
│                       ├── PutPetResponse.java
│                       └── PutPetResponseOrBuilder.java
└── petapis
    ├── google
    │   └── type
    │       └── datetime.proto
    └── pet
        └── v1
            └── pet.proto
```

We'll come back to **Managed Mode** in a more complex example [later in the tour](use-managed-mode.md), so we'll
restore the previous `buf.gen.yaml` configuration before we continue:

```yaml title=buf.gen.yaml {2-5}
 version: v1
-managed:
-  enabled: true
-  cc_enable_arenas: false
-  java_multiple_files: true
 plugins:
   - name: cpp
     out: gen/proto/cpp
   - name: java
     out: gen/proto/java
```

Again, regenerate the original code with the following:

```terminal
$ rm -rf gen
$ buf generate petapis
```
