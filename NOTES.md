# NOTES

## TLDR

project use `node/v10.12.0` version, else `fs-extra/lib/mkdirs/make-dir.js:86`

## Links

P1 https://www.youtube.com/watch?v=9sNgCiPnhZE
P2 https://www.youtube.com/watch?v=Iu5mYkiSk9k

## Bootstrap app

```shell
$ nest new api
$ cd api
$ npm i neo4j-driver
$ npm i -D tsc-watch env-cmd
# create modules
$ nest g mo neo4j
# create service
$ nest g s neo4j
# create interface
$ nest g interface neo4j-config
```

## Implement @nestjs/config

```shell
$ npm i --save @nestjs/config
```

## Fire some curls

```shell
$ curl -X GET http://localhost:3080/
$ curl -X GET http://localhost:3080/total-nodes
$ curl -X POST http://localhost:3080/movie \
  -H "Content-Type: application/json" \
  -d '{ "title": "Toy Story", "tagline": "Hang on for the comedy that goes to infinity and beyond!", "released": "2009"}'
  # test cypher
$ MATCH (n {title: "Toy Story"}) RETURN n
```

## Fix: 50:24 Nest can\'t resolve dependencies of the Neo4jService

```shell
[Nest] 16765   - 07/08/2020, 12:12:31 AM   [ExceptionHandler] Nest can\'t resolve dependencies of the Neo4jService (?, NEO4J_DRIVER). Please make sure that the argument NEO4J_CONFIG at index [0] is available in the Neo4jModule context.

Potential solutions:
- If NEO4J_CONFIG is a provider, is it part of the current Neo4jModule?
- If NEO4J_CONFIG is exported from a separate @Module, is that module imported within Neo4jModule?
  @Module({
    imports: [ /* the Module containing NEO4J_CONFIG */ ]
  })
```

> because this is a static module `static forRoot(config: Neo4jConfig): DynamicModule {` it tries to resolve `providers: [Neo4jService]` module, just remove it and it start to work

change `src/neo4j/neo4j.module.ts`

```typescript
@Module({
  providers: [Neo4jService]
})
```

to

```typescript
@Module({})
```

## Fix: 51:46 : Nest can\'t resolve dependencies of the AppService

```shell
[ExceptionHandler] Nest can\'t resolve dependencies of the AppService (?). Please make sure that the argument Neo4jService at index [0] is available in the AppModule context.

Potential solutions:
- If Neo4jService is a provider, is it part of the current AppModule?
- If Neo4jService is exported from a separate @Module, is that module imported within AppModule?
  @Module({
    imports: [ /* the Module containing Neo4jService */ ]
  })
```
replace static import with forRoot

replace `src/app.module.ts`

```typescript
imports: [Neo4jModule]
```

with
```typescript
imports: [
  Neo4jModule.forRootAsync({...
]
```

## TODO: Fix Tests: WIP

```shell
$ npm run test
Potential solutions:
- If NEO4J_CONFIG is a provider, is it part of the current RootTestModule?
- If NEO4J_CONFIG is exported from a separate @Module, is that module imported within RootTestModule?
  @Module({
    imports: [ /* the Module containing NEO4J_CONFIG */ ]
  })
```

```typescript
describe('Neo4jService', () => {
  let service: Neo4jService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Neo4jService],
    }).compile();
```

remove `providers: [Neo4jService]` from `src/neo4j/neo4j.service.spec.ts`

```shell
Error: Nest can\'t resolve dependencies of the AppService (?). Please make sure that the argument Neo4jService at index [0] is available in the RootTestModule context.

Potential solutions:
- If Neo4jService is a provider, is it part of the current RootTestModule?
- If Neo4jService is exported from a separate @Module, is that module imported within RootTestModule?
  @Module({
    imports: [ /* the Module containing Neo4jService */ ]
  })Jest
```

## Configure Fabric with nestjs

```shell
# install dependencies
$ npm i fabric-ca-client fabric-network
# create modules
$ nest g mo network
# create service
$ nest g s network
# create interface
$ nest g interface network-config

nest g m
nest g s
```

## Fix: node_modules/fs-extra/lib/mkdirs/make-dir.js:86

- [PKG Dependency has an issue](https://github.com/vercel/pkg/issues/883)

```shell
/media/mario/Storage/Documents/Development/@SolidaryChain/solidarychain-development-graphdb-events/node_modules/fs-extra/lib/mkdirs/make-dir.js:86
      } catch {
```

> I had the same issue using node 8.10.0, After upgrading my node version to 10.13.0 the error was gone

> use `node/v10.12.0` or greater, there is no need to use `node/v8.16.0`, this is not a convector project