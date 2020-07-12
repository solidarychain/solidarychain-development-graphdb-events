import 'reflect-metadata';
import { Logger, Type } from "@nestjs/common";
import { QueryResult } from 'neo4j-driver/types/result';
import { Neo4jService } from 'src/neo4j/neo4j.service';

// export const decorator = () => {
//   return (target: Object, key: string | symbol) => {
//     let val = target[key];

//     const getter = () => {
//       return val;
//     }
//     const setter = (next) => {
//       Logger.debug(`updating decorator`)
//       val = `#${next}#`;
//     }

//     Object.defineProperty(target, key, {
//       get: getter,
//       set: setter,
//       enumerable: true,
//       configurable: true,
//     })
//   }
// }

const formatMetadataKey = Symbol("Properties");

export const Properties = (props?: { fieldName?: string, query?: string }) => {
  return Reflect.metadata(formatMetadataKey, props);
}

export const getProperties = (target: any, propertyKey: string) => {
  // if (propertyKey === 'code') {
  //   debugger;
  // }
  return Reflect.getMetadata(formatMetadataKey, target, propertyKey);
}



export const metadataKey = 'Persisted';

export const Persisted = (target, propertyKey) => {
  Reflect.defineMetadata(metadataKey, true, target, propertyKey);
}

/**
 * used with class ex: PersistedUsingClass(MyClass, 'property2')
 * @param type
 * @param propertyKey 
 */
export const PersistedUsingClass = <T>(type: Type<T>, propertyKey: string) => {
  return PersistedUsingInstance(new type(), propertyKey);
}

/**
 * used with instance ex: PersistedUsingInstance(instance, 'property1')
 * @param instance 
 * @param propertyKey 
 */
export const PersistedUsingInstance = <T>(instance: T, propertyKey: string) => {
  return !!Reflect.getMetadata(metadataKey, instance, propertyKey);
}

export class BaseModel {
  private neo4jService: Neo4jService;

  @Persisted
  public id: string;

  @Persisted
  public blockNumber: number;

  @Persisted
  public transactionId: string;

  @Persisted
  @Properties({ fieldName: 'transactionStatus' })
  public status: string;

  constructor(
    blockNumber?: string, transactionId?: string, status?: string
  ) {
    this.blockNumber = Number(blockNumber);
    this.transactionId = transactionId;
    this.status = status;
  }

  private getSaveCypher() {
    const props = Object.entries(this);
    // https://www.thecodecampus.de/blog/pitfall-using-object-keys-with-typescript-classes/
    // const descriptors = Object.getOwnPropertyDescriptors(this);
    // const propertyNames = Object.getOwnPropertyNames(this);
    debugger;
    // Logger.debug(`props: ${JSON.stringify(props, undefined, 2)}`);

    props.forEach((e) => {
      const [k, v] = e;
      if (k === 'goodsStock') {
        debugger;
      }
      const props = getProperties(this, k);
      const fieldName = (props) ? props.fieldName : undefined;
      const query = (props) ? props.query : undefined;
      Logger.log(`k:[${k}], v:[${v}], Persisted:[${PersistedUsingInstance(this, k)}], fieldName:[${fieldName}], query:[${query}]`);
    });
  }

  async save(neo4jService: Neo4jService) {
    this.getSaveCypher();
    const cypher = `
        MERGE 
          (n:Participant {
            code: $code, 
            name: $name
          })
        RETURN 
          n.code AS code,  
          n.name as name
      `;
    debugger;
    const result: void | QueryResult = await neo4jService.write(cypher, this)
      .catch((error) => {
        Logger.error(error);
      });
    if (!result) {
      return {};
    }
    return result.records;
  }
}
