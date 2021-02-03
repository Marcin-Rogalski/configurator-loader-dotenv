// interface to be extended with users defined Options interface
export interface ConfigurationBase { [key: string]: string | number | boolean }


// type defining a loader to be used to add data to process.env
export type Loader<T> = (options: Partial<T>) => Partial<T>