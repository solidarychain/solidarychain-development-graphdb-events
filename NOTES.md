# NOTES

## TLDR

project use `node/v12.8.1` version, else `fs-extra/lib/mkdirs/make-dir.js:86`

## Links

- [1. Introducing the client | Building Web Applications with Neo4j and TypeScript](https://www.youtube.com/watch?v=Iu5mYkiSk9k)
- [2. Integrating Neo4j with NestJS | Building Web Applications with Neo4j and TypeScript](https://www.youtube.com/watch?v=9sNgCiPnhZE)

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

## Error: Unable to initialize channel. Attempted to contact 1 Peers

```shell
node:27684) UnhandledPromiseRejectionWarning: Error: Unable to initialize channel. Attempted to contact 1 Peers. Last error was Error: Channel:channelall Discovery error:access denied
```

using unsync wallets, use `solidarychain-development-graphdb-events/network/bringWalletFiles.sh`

## Containerized development with NestJS and Docker

- [Containerized development with NestJS and Docker](https://blog.logrocket.com/containerized-development-nestjs-docker/)

## Fix Docker Neo4jError: Could not perform discovery. No routing servers available. Known routing table: RoutingTable[database=default database, expirationTime=0, currentTime=1597098363713, routers=[], readers=[], writers=[]]

- https://stackoverflow.com/questions/60637096/how-to-fix-neo4j-docker-container-service-unavailable-error-could-not-perfor
- https://github.com/neo4j/neo4j-javascript-driver/issues/516

## Exception has occurred: Neo4jError: Neo4jError: This connection holder does not serve connections

transactions work, but in debug fire this exception

occurs only in new transaction, and and in `links-laptop`, in koakh-ultrabook it won't occur

## Exception has occurred: Neo4jError: Neo4jError: Could not perform discovery. No routing servers available. Known routing table: RoutingTable[database=default database, expirationTime=0, currentTime=1597938023892, routers=[], readers=[], writers=[]]

after restart neo4j server and clean database, and add SCHEMA, when we launch `npm run start:debug`
I noted that chrome can't login to, it lost connection, but firefox works

```shell
$ npm run start:debug
[Nest] 31940   - 08/20/2020, 4:32:15 PM   [Neo4jModule] error:Connection [0][] experienced a fatal error {"message":"Failed to connect to server. Please ensure that your database is listening on the correct host and port and that you have compatible encryption settings both on Neo4j server and driver. Note that the default encryption setting has changed in Neo4j 4.0. Caused by: Server certificate is not trusted. If you trust the database you are connecting to, use TRUST_CUSTOM_CA_SIGNED_CERTIFICATES and add the signing certificate, or the server certificate, to the list of certificates trusted by this driver using `neo4j.driver(.., { trustedCertificates:['path/to/certificate.crt']}). This  is a security measure to protect against man-in-the-middle attacks. If you are just trying  Neo4j out and are not concerned about encryption, simply disable it using `encrypted=\"ENCRYPTION_OFF\"` in the driver options. Socket responded with: CERT_HAS_EXPIRED","stack":"Neo4jError: Failed to connect to server. Please ensure that your database is listening on the correct host and port and that you have compatible encryption settings both on Neo4j server and driver. Note that the default encryption setting has changed in Neo4j 4.0. Caused by: Server certificate is not trusted. If you trust the database you are connecting to, use TRUST_CUSTOM_CA_SIGNED_CERTIFICATES and add the signing certificate, or the server certificate, to the list of certificates trusted by this driver using `neo4j.driver(.., { trustedCertificates:['path/to/certificate.crt']}). This  is a security measure to protect against man-in-the-middle attacks. If you are just trying  Neo4j out and are not concerned about encryption, simply disable it using `encrypted=\"ENCRYPTION_OFF\"` in the driver options. Socket responded with: CERT_HAS_EXPIRED\n    at newError (/media/mario/Storage/Documents/Development/@SolidaryChain/solidarychain-development-graphdb-events/node_modules/neo4j-driver/lib/error.js:79:10)\n    at NodeChannel._handleConnectionError (/media/mario/Storage/Documents/Development/@SolidaryChain/solidarychain-development-graphdb-events/node_modules/neo4j-driver/lib/internal/node/node-channel.js:226:41)\n    at TLSSocket.<anonymous> (/media/mario/Storage/Documents/Development/@SolidaryChain/solidarychain-development-graphdb-events/node_modules/neo4j-driver/lib/internal/node/node-channel.js:72:9)\n    at Object.onceWrapper (events.js:273:13)\n    at TLSSocket.emit (events.js:182:13)\n    at TLSSocket.onConnectSecure (_tls_wrap.js:1070:12)\n    at TLSSocket.emit (events.js:182:13)\n    at TLSSocket._finishInit (_tls_wrap.js:631:8)","code":"SessionExpired","name":"Neo4jError"}
```

the fix was strange is fixed with

```shell
$ cd /srv/docker/neo4j/neo4j406ent
$ ./updatecertificates.sh
$ docker-compose down && docker-compose up -d && docker-compose logs -f
$ npm run start:debug
...
[Nest] 10373   - 08/20/2020, 4:49:19 PM   [Neo4jModule] info:Routing table is stale for database: "" and access mode: "READ": RoutingTable[database=default database, expirationTime=0, currentTime=1597938559884, routers=[], readers=[], writers=[]] +4ms
[Nest] 10373   - 08/20/2020, 4:49:20 PM   [Neo4jModule] info:Updated routing table RoutingTable[database=default database, expirationTime=1597938860158, currentTime=1597938560160, routers=[neo4j.koakh.com:7687], readers=[neo4j.koakh.com:7687], writers=[neo4j.koakh.com:7687]] +277ms
...
# now it works
```

> I change databases in browser launch

```cypher
use system
SHOW DATABASES;
╒════════╤══════════════════════╤════════════╤═════════════════╤═══════════════╤═══════╤═════════╕
│"name"  │"address"             │"role"      │"requestedStatus"│"currentStatus"│"error"│"default"│
╞════════╪══════════════════════╪════════════╪═════════════════╪═══════════════╪═══════╪═════════╡
│"neo4j" │"neo4j.koakh.com:7687"│"standalone"│"online"         │"online"       │""     │true     │
├────────┼──────────────────────┼────────────┼─────────────────┼───────────────┼───────┼─────────┤
│"system"│"neo4j.koakh.com:7687"│"standalone"│"online"         │"online"       │""     │false    │
└────────┴──────────────────────┴────────────┴─────────────────┴───────────────┴───────┴─────────┘
```

## Dependency Injection 

```typescript
export class AuthController {
  constructor(
    // require to use @Inject(AUTH_CONFIG)
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
    // here @Inject(Class) is optional
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) { }
```

> `@Inject(AUTH_CONFIG)` is required, else DI can't find AuthConfig to inject

> last update: find that network module and service inject config without the need for `@inject`, can't know how, but seems that is related to using `inject: [NETWORK_CONFIG]`

## Problem: TypeError: Class extends value undefined is not a constructor or null

- [](https://stackoverflow.com/questions/43176006/typeerror-class-extends-value-undefined-is-not-a-function-or-null)

```shell
/media/mario/Storage/Documents/Development/@SolidaryChain/solidarychain-development-graphdb-events/dist/network/models/asset.model.js:17
class Asset extends index_1.BaseModel {
TypeError: Class extends value undefined is not a constructor or null
```

- [madge](https://github.com/pahen/madge)

```shell
$ madge --circular --extensions ts src/
✖ Found 20 circular dependencies!

1) index.ts > app.controller.ts
2) auth/auth.controller.ts > auth/index.ts
3) auth/index.ts > auth/auth.module.ts > auth/auth.resolver.ts
4) auth/index.ts > auth/auth.module.ts
5) auth/index.ts > auth/auth.service.ts
6) neo4j/index.ts > neo4j/neo4j.module.ts
7) neo4j/index.ts > neo4j/neo4j.service.ts
8) neo4j/index.ts > neo4j/neo4j.util.ts
9) network/index.ts > network/network.module.ts
10) network/index.ts > network/network.service.ts
11) network/index.ts > network/network.util.ts
12) network/models/asset.model.ts > network/models/index.ts
13) network/models/index.ts > network/models/cause.model.ts
14) network/models/index.ts > network/models/good.model.ts
15) network/models/index.ts > network/models/participant.model.ts
16) network/models/index.ts > network/models/person.model.ts
17) network/models/index.ts > network/models/transaction.model.ts
18) user/index.ts > user/user.module.ts
19) user/index.ts > user/user.resolver.ts
20) user/index.ts > user/user.service.ts
```

[Nest] 1020   - 09/05/2020, 12:20:54 AM   [ExceptionHandler] A circular dependency has been detected. Please, make sure that each side of a bidirectional relationships are decorated with "forwardRef()". +253ms

TIP DONT USE BAREL FILES IN ROOT OF MODULES, else we can use it
this occurs because we use files that use files ....and it creates a circular Problem