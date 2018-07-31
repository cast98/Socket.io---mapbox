const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('user', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        surname: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        coordLongitude: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        coordLatitude: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        }
    }, {
            timestamps: true,
            freezeTableName: true,
        });

    return User;
};
