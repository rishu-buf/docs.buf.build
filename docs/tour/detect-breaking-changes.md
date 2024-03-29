---
id: detect-breaking-changes
title: 4 Detect Breaking Changes
---

You can detect breaking changes between different versions of your API. `buf` is able to
detect one of the following categories of breaking changes:

  - [`FILE`](../breaking/rules.md#categories)
  - [`PACKAGE`](../breaking/rules.md#categories)
  - [`WIRE`](../breaking/rules.md#categories)
  - [`WIRE_JSON`](../breaking/rules.md#categories)

The default value is `FILE`, which is our recommendation to guarantee maximum compatibility
across your users. As opposed to linting, you generally will not mix and exclude specific
breaking change rules, instead choosing one of these options. We currently have the first
option configured:

```yaml title="buf.yaml"
version: v1
lint:
  use:
    - DEFAULT
breaking:
  use:
    - FILE
```

## 4.1 Break Your API {#break-your-api}

Next, you'll need to introduce a breaking change. First, you'll make a change that is breaking at the
`WIRE` level. This is the most fundamental type of breaking change as it will change how the Protobuf
messages are encoded in transit (i.e. "on the wire"). This type of breaking change affects _all_ users,
in _all_ languages.

For example, change the type of the `Pet.pet_type` field from `PetType` to `string`:

```protobuf title=pet/v1/pet.proto {2-3}
 message Pet {
-  PetType pet_type = 1;
+  string pet_type = 1;
   string pet_id = 2;
   string name = 3;
 }
```

## 4.2 Run `buf breaking` {#run-buf-breaking}

Now, you can verify that this is a breaking change against the local `main` branch. You'll also notice errors
related to the changes we made in the [previous step](lint-your-api.md):

```terminal
$ buf breaking --against ../../.git#branch=main,subdir=start/petapis
pet/v1/pet.proto:1:1:Previously present service "PetStore" was deleted from file.
pet/v1/pet.proto:20:3:Field "1" on message "Pet" changed type from "enum" to "string".
pet/v1/pet.proto:44:3:Field "1" with name "pet_id" on message "DeletePetRequest" changed option "json_name" from "petID" to "petId".
pet/v1/pet.proto:44:10:Field "1" on message "DeletePetRequest" changed name from "petID" to "pet_id".
```

Similarly, we can target a `zip` archive from the remote repository:

```terminal
$ buf breaking --against "https://github.com/bufbuild/buf-tour/archive/main.zip#strip_components=1,subdir=start/petapis" --config buf.yaml
pet/v1/pet.proto:1:1:Previously present service "PetStore" was deleted from file.
pet/v1/pet.proto:20:3:Field "1" on message "Pet" changed type from "enum" to "string".
pet/v1/pet.proto:44:3:Field "1" with name "pet_id" on message "DeletePetRequest" changed option "json_name" from "petID" to "petId".
pet/v1/pet.proto:44:10:Field "1" on message "DeletePetRequest" changed name from "petID" to "pet_id".
```

> For remote locations that require authentication, see [HTTPS Authentication](../reference/inputs.md#https) and
> [SSH Authentication](../reference/inputs.md#ssh) for more details.

## 4.3 Revert Changes {#revert-changes}

Once done, revert the breaking change:

```protobuf title=pet/v1/pet.proto {2-3}
 message Pet {
-  PetType pet_type = 1;
+  string pet_type = 1;
   string pet_id = 2;
   string name = 3;
 }
```

## 4.4 Read an Image from stdin {#read-an-image-from-stdin}

Like all other `buf` commands, `buf breaking` can read input from stdin. This is useful if, for example,
you are downloading an [image](../reference/images.md) from a private location. As a fun but useless example,
let's build an image out of our current state, write it to stdout, then compare against the input from stdin.
This should _always_ pass, as it is comparing the current state to the current state:

```terminal
$ buf build -o - | buf breaking --against -
```
