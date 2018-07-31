const sequelize = require('./sequelize');

const models = {};

[
    require('./User'),
].forEach((e) => {
    const model = e(sequelize);
    let modelName = model.name.split('_').map(e => e[0].toUpperCase() + e.slice(1)).join('');
    models[modelName] = model;
});

module.exports = models;
