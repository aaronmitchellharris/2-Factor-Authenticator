const {Datastore} = require('@google-cloud/datastore');

const datastore = new Datastore();

const fromDatastore = (obj) => {
    obj.id = parseInt(obj[Datastore.KEY].id, 10);

    return obj;
};

const toDatastore = (obj, nonIndexed) => {
    nonIndexed = nonIndexed || [];
    const results = [];
    Object.keys(obj).forEach((k) => {
        if (obj[k] === undefined) {
            return;
        }
        results.push({
            name: k,
            value: obj[k],
            excludeFromIndexes: nonIndexed.indexOf(k) !== -1
        });
    });
    return results;
};

const create = (kind, data) => {
    
    const key = datastore.key(kind);

    return datastore.save({key: key, data: data}).then(() => {
        return key;
    });
};

const read = (kind, id) => {

    const key = datastore.key([kind, id]);

    return datastore.get(key).then(entity => {
        if (entity[0] == undefined || entity[0] == null) {
            return null;
        } else {
            return entity[0];
        }
    });
};

const list = (kind, cursor) => {
    
    let q = datastore.createQuery(kind).limit(3);

    if (cursor) {
        q = q.start(cursor);
    }

    return datastore.runQuery(q).then(entities => {
        
        const list = {
            "results": entities[0].map(fromDatastore),
            "cursor": null
        };

        if (entities[1].moreResults !== Datastore.NO_MORE_RESULTS) {
            list.cursor = encodeURIComponent(entities[1].endCursor);
        }

        return list;
    });
};

const update = (kind, id, data) => {

    const key = datastore.key([kind, id]);

    return datastore.get(key).then(entity => {
        if (entity[0] == undefined || entity[0] == null) {
            return null;
        } else {
            return datastore.save({key: key, data: data}).then(() => {
                return data;
            });
        }
    });
};

const _delete = (kind, id) => {
    
    const key = datastore.key([kind, id]);

    return datastore.delete(key).then(err => {
        if (err[0].indexUpdates != 0) {
            return 1;
        } else {
            return null;
        }
    });
};

module.exports = {
    create,
    read,
    list,
    update,
    delete: _delete
};