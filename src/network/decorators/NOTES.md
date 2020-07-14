export const decorator = () => {
  return (target: Object, key: string | symbol) => {
    let val = target[key];
    const getter = () => {
      return val;
    }
    const setter = (next) => {
      Logger.debug(`updating decorator`)
      val = `#${next}#`;
    }
    Object.defineProperty(target, key, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true,
    })
  }
}
