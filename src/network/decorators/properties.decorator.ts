export const formatMetadataKey = Symbol("Properties");

export const Properties = (props?: { fieldName?: string, returnField?: boolean, map?: Object[], transform?: Function }) => {
  return Reflect.metadata(formatMetadataKey, props);
}

export const getProperties = (target: any, propertyKey: string) => {
  return Reflect.getMetadata(formatMetadataKey, target, propertyKey);
}
