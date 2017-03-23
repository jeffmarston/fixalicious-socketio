'use strict';

let Sequelize = require('sequelize');
let Adapter = require('./SQLAdapter');


class RatingSchema {
    constructor() {
        this.agencySchema = Adapter.define('ec_ratingagency',
            {
                RatingAgencyCD: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                    allowNull: false,
                },
                RatingAgencyDesc: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                TermLength: {
                    type: Sequelize.STRING,
                    allowNull: false
                }
            },
            {
                freezeTableName: true,
                timestamps: false
            });

        this.ratingSchema = Adapter.define('ec_ratingcode',
            {
                RatingAgencyCD: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                RatingCD: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                    allowNull: false
                },
                RatingDesc:
                {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                RatingValue:
                {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                }
            },
            {
                freezeTableName: true,
                timestamps: false
            });

        this.agencySchema.hasMany(this.ratingSchema, { as: 'ratings', foreignKey: 'RatingAgencyCD' });
        this.ratingSchema.belongsTo(this.agencySchema, { foreignKey: 'RatingAgencyCD' });

        // Adding and extension method to the Sequelize model to simplify the rating-model development experience
        this.ratingSchema.saveAll = function (ratingAgencyName, ratings) {
            let schema = new RatingSchema();
            return Adapter.transaction((t) => {
                return schema.ratingSchema.destroy({
                    where: { RatingAgencyCD: ratingAgencyName } }, { transaction: t })
                    .then(() => schema.ratingSchema.bulkCreate(ratings, { transaction: t }))
                    .then((result) => result ? result.length : null);
            })
                .then((numberOfUpdates) => { return numberOfUpdates; });
        }
    }
};

module.exports = RatingSchema;