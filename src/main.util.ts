import { Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

/**
 * parse json object from file
 * @param filePath
 */
export const readJsonFromFile = (filePath: string) => {
  const absolutePath = path.join(process.cwd(), filePath);
  const fileContents = fs.readFileSync(absolutePath, 'utf8');
  return JSON.parse(fileContents);
};

/**
 * write json object to file
 * @param filePath 
 */
export const writeJsonToFile = async (filePath: string, data: any) => {
  try {
    await fs.promises.writeFile(filePath, data);
  } catch (error) {
    Logger.error(error, 'MainUtil');
  }
}

/**
 * generic function to get Enum key from a Enum value
 * @param enumType a typescript Type
 * @param enumValue string value
 */
export const getEnumKeyFromEnumValue = (
  enumType: any,
  enumValue: string | number,
): any => {
  const keys: string[] = Object.keys(enumType).filter(
    x => enumType[x] === enumValue,
  );
  if (keys.length > 0) {
    return keys[0];
  } else {
    // throw error to caller function
    // throw new Error(`Invalid enum value '${enumValue}'! Valid enum values are ${Object.keys(myEnum)}`);
    throw new Error(
      `Invalid enum value '${enumValue}'! Valid enum value(s() are ${Object.values(
        enumType,
      )}`,
    );
  }
};

/**
 * generic function to get Enum value from a Enum key
 * @param enumType a typescript Type
 * @param enumValue string value
 */
export const getEnumValueFromEnumKey = (
  enumType: any,
  enumKey: string | number,
): any => {
  // use getEnumKeyByEnumValue to get key from value
  const keys = Object.keys(enumType).filter(
    x => getEnumKeyFromEnumValue(enumType, enumType[x]) === enumKey,
  );
  if (keys.length > 0) {
    // return value from equality key
    return enumType[keys[0]];
  } else {
    // throw error to caller function
    throw new Error(
      `Invalid enum key '${enumKey}'! Valid enum key(s() are ${Object.keys(
        enumType,
      )}`,
    );
  }
};

/**
 * ES7 / 2016 remove json empty properties recursivly
 * @param obj
 */
export const removeEmpty = obj => {
  Object.entries(obj).forEach(
    ([key, val]) =>
      (val && typeof val === 'object' && removeEmpty(val)) ||
      ((val === undefined || val === null || val === '') && delete obj[key]),
  );
  return obj;
};

/**
 * simple helper method to check if is a valid directory
 * @param dirPath
 */
export const isDirectory = (dirPath: string): Promise<boolean> => new Promise((resolve, reject) => {
  try {
    fs.lstat(dirPath, (error: NodeJS.ErrnoException, stats: fs.Stats) => {
      if (error) {
        // reject(error);
        resolve(false);
      } else {
        resolve(stats.isDirectory());
      }
    });
  } catch (error) {
    reject(error);
  }
});

/**
 * Recursively creates directories until `targetDir` is valid.
 * @param targetDir target directory path to be created recursively.
 * @param isRelative is the provided `targetDir` a relative path?
 */
export const mkdirRecursiveSync = (targetDir: string, isRelative = true) => {
  const separator: string = path.sep;
  const initDir: string = path.isAbsolute(targetDir) ? separator : '';
  const baseDir: string = isRelative ? process.cwd() : '.';

  targetDir.split(separator).reduce((prevDirPath, dirToCreate) => {
    const curDirPathToCreate = path.resolve(baseDir, prevDirPath, dirToCreate);
    try {
      fs.mkdirSync(curDirPathToCreate);
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
      // caught EEXIST error if curDirPathToCreate already existed (not a problem for us).
    }
    // becomes prevDirPath on next call to reduce
    return curDirPathToCreate;
  }, initDir);
};

/**
 * helper to create directories array, usefull on bootstrap app
 * @param directories aray of directories
 */
export const initDirectories = async (directories: string[]) => {
  directories.forEach(async (e) => {
    if (!await isDirectory(e)) {
      mkdirRecursiveSync(e);
    }
  });
}