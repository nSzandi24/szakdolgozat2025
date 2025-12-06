const { DataTypes, Model } = require('sequelize');
const argon2 = require('argon2');

module.exports = (sequelize) => {
  class User extends Model {}

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.VIRTUAL,
        allowNull: true,
      },
      password_digest: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      permission: {
        type: DataTypes.ENUM('admin', 'user'),
        allowNull: false,
        defaultValue: 'user',
      },
    },
    {
      sequelize,
      modelName: 'User',
      underscored: true,
      tableName: 'users',
      timestamps: true,
    }
  );

  User.beforeCreate(async (user) => {
    if (user.password) {
      const hashed = await argon2.hash(user.password);
      user.password_digest = hashed;
    }
  });

  User.beforeUpdate(async (user) => {
    if (user.password) {
      const hashed = await argon2.hash(user.password);
      user.password_digest = hashed;
    }
  });

  User.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    delete values.password;
    delete values.password_digest;
    return values;
  };

  return User;
};
