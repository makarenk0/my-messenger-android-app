export const loadDB = (dbName) => (
    {
      type: 'LOAD_DB',
      payload: {'dbName': dbName}
    }
  );

export const saveDocToDB = (docToSave, callback) => (
    {
      type: 'SAVE_DOC',
      payload: {'docToSave': docToSave, 'callback': callback}
    }
  );


  export const loadDocFromDB = (parametrsObj, callback) => (
    {
      type: 'LOAD_DOC',
      payload: {'parametrsObj': parametrsObj, 'callback': callback}
    }
  );

  export const removeDocFromDB = (parametrsObj, multi, callback) => (
    {
      type: 'REMOVE_DOC',
      payload: {'parametrsObj': parametrsObj, 'multi': multi, 'callback': callback}
    }
  );

  export const addToArray = (parametrsObj, toAdd, callback) => (
    {
      type: 'ADD_TO_ARRAY',
      payload: {'parametrsObj': parametrsObj, 'toAdd': toAdd, 'callback': callback}
    }
  );

  export const removeFromArray = (parametrsObj, toRemove, callback) => (
    {
      type: 'REMOVE_FROM_ARRAY',
      payload: {'parametrsObj': parametrsObj, 'toRemove': toRemove, 'callback': callback}
    }
  );

  