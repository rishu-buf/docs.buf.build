---
id: lint-your-api
title: 3 Lint Your API
---

You can run all of the configured lint rules with the following:

```terminal
$ buf lint
google/type/datetime.proto:17:1:Package name "google.type" should be suffixed with a correctly formed version, such as "google.type.v1".
pet/v1/pet.proto:44:10:Field name "petID" should be lower_snake_case, such as "pet_id".
pet/v1/pet.proto:49:9:Service name "PetStore" should be suffixed with "Service".
```

You can also output this as JSON:

```terminal
$ buf lint --error-format=json
{"path":"google/type/datetime.proto","start_line":17,"start_column":1,"end_line":17,"end_column":21,"type":"PACKAGE_VERSION_SUFFIX","message":"Package name \"google.type\" should be suffixed with a correctly formed version, such as \"google.type.v1\"."}
{"path":"pet/v1/pet.proto","start_line":44,"start_column":10,"end_line":44,"end_column":15,"type":"FIELD_LOWER_SNAKE_CASE","message":"Field name \"petID\" should be lower_snake_case, such as \"pet_id\"."}
{"path":"pet/v1/pet.proto","start_line":49,"start_column":9,"end_line":49,"end_column":17,"type":"SERVICE_SUFFIX","message":"Service name \"PetStore\" should be suffixed with \"Service\"."}
```

As you can see, the current pet store API has a few lint failures across both of its
files. These failures belong to the [`DEFAULT`](../lint/rules.md#default) lint category
configured in the [`buf.yaml`](../configuration/v1/buf-yaml.md):

```yaml title="buf.yaml"
version: v1
lint:
  use:
    - DEFAULT
breaking:
  use:
    - FILE
```

## 3.1 Lint Exceptions {#lint-exceptions}

The `DEFAULT` lint category failures we're seeing come from following rules:

  * [`PACKAGE_VERSION_SUFFIX`](../lint/rules.md#package_version_suffix)
  * [`FIELD_LOWER_SNAKE_CASE`](../lint/rules.md#field_lower_snake_case)
  * [`SERVICE_SUFFIX`](../lint/rules.md#service_suffix)

If we want to make `buf` happy, we can exclude these rules from the `DEFAULT` category like so:

```yaml title="buf.yaml" {5-8}
 version: v1
 lint:
   use:
     - DEFAULT
+  except:
+    - PACKAGE_VERSION_SUFFIX
+    - FIELD_LOWER_SNAKE_CASE
+    - SERVICE_SUFFIX
 breaking:
   use:
     - FILE
```

Now if we run `buf lint` again, you'll notice that it's successful (i.e. exit code 0 and no output):

```terminal
$ buf lint
```

However, this isn't actually what we want - we should actually fix the lint failures instead of making
exceptions. Although `except` is **not recommended**, it's unavoidable in some situations. You can restore
the `buf.yaml` to its previous state with the following:

```yaml title="buf.yaml" {5-8}
 version: v1
 lint:
   use:
     - DEFAULT
-  except:
-    - PACKAGE_VERSION_SUFFIX
-    - FIELD_LOWER_SNAKE_CASE
-    - SERVICE_SUFFIX
 breaking:
   use:
     - FILE
```

## 3.2 Fix Lint Failures {#fix-lint-failures}

We'll start by fixing the lint failures for the `pet/v1/pet.proto` file, which come from the `FIELD_LOWER_SNAKE_CASE`
and `SERVICE_SUFFIX` rules. Fortunately, `buf` tells us exactly what we need to do to fix the errors, so we can
apply the changes with the following:

```protobuf title="pet/v1/pet.proto" {10-11,16-17}
 syntax = "proto3";

 package pet.v1;

 option go_package = "github.com/bufbuild/buf-tour/petstore/gen/proto/go/pet/v1;petv1";

...

 message DeletePetRequest {
-  string petID = 1;
+  string pet_id = 1;
 }

 message DeletePetResponse {}

-service PetStore {
+service PetStoreService {
   rpc GetPet(GetPetRequest) returns (GetPetResponse) {}
   rpc PutPet(PutPetRequest) returns (PutPetResponse) {}
   rpc DeletePet(DeletePetRequest) returns (DeletePetResponse) {}
 }
```

With this, we can verify that two of the failures are resolved:

```terminal
$ buf lint
google/type/datetime.proto:17:1:Package name "google.type" should be suffixed with a correctly formed version, such as "google.type.v1".
```

## 3.3 Ignore Lint Failures {#ignore-lint-failures}

The `google/type/datetime.proto` isn't actually a file we own (it's one of our dependencies, which is provided by
[googleapis](https://buf.build/googleapis/googleapis)), so we can't simply change its `package` declaration to
satisfy `buf`'s lint requirements. Fortunately, we can `ignore` the `google/type/datetime.proto` file from
`buf lint` like so:

```yaml title="buf.yaml" {5-6}
 version: v1
 lint:
   use:
     - DEFAULT
+  ignore:
+    - google/type/datetime.proto
 breaking:
   use:
     - FILE
```

Alternatively, we could specify exactly what rules we ignore with the `ignore_only` configuration. We can output failures
in a format you can then copy into your `buf.yaml` file. This allows you to ignore all existing lint errors and correct them
over time:

```terminal
$ buf lint --error-format=config-ignore-yaml
version: v1
lint:
  ignore_only:
    PACKAGE_VERSION_SUFFIX:
      - google/type/datetime.proto
```

However, we don't own the `google/type/datetime.proto` file, so it's much easier to `ignore` it altogether.

## 3.4 Remote Inputs {#remote-inputs}

The `buf lint` command also works with remote inputs, using the local `buf.yaml` configuration. For example, we can see all
the original lint failures if we reference a `tar.gz` archive from the `main` branch:

```terminal
$ buf lint "https://github.com/bufbuild/buf-tour/archive/main.tar.gz#strip_components=1,subdir=start/petapis" --config buf.yaml
start/petapis/pet/v1/pet.proto:44:10:Field name "petID" should be lower_snake_case, such as "pet_id".
start/petapis/pet/v1/pet.proto:49:9:Service name "PetStore" should be suffixed with "Service".
```

  * The `strip_components` option specifies the number of directories to strip for `tar` or `zip` inputs.

> For remote locations that require authentication, see [HTTPS Authentication](../reference/inputs.md#https) and
> [SSH Authentication](../reference/inputs.md#ssh) for more details.
