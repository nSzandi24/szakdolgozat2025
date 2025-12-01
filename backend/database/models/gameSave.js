const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class GameSave extends Model {
    static getDefaultState() {
      return {
        currentLocation: 'otthon',
        currentSceneIds: {},
        discoveredLocations: ['otthon'],
        gameFlags: {},
        collectedItems: [],
        seenOnceScenes: [],
        reachedRestartPoints: [],
        investigationCompleted: false,
        lucasDialogueCompleted: false,
        lucasAvailable: true,
      };
    }

    static async getOrCreateForUser(userId) {
      const [gameSave] = await GameSave.findOrCreate({
        where: { userId },
        defaults: {
          userId,
          ...GameSave.getDefaultState(),
        },
      });
      return gameSave;
    }

    static async updateGameState(userId, updates) {
      const gameSave = await GameSave.getOrCreateForUser(userId);
      await gameSave.update(updates);
      return gameSave;
    }

    static async resetProgress(userId) {
      const gameSave = await GameSave.getOrCreateForUser(userId);
      await gameSave.update(GameSave.getDefaultState());
      return gameSave;
    }

    toGameState() {
      return {
        currentLocation: this.currentLocation,
        currentSceneIds: this.currentSceneIds || {},
        discoveredLocations: this.discoveredLocations || ['Otthon'],
        gameFlags: this.gameFlags || {},
        collectedItems: this.collectedItems || [],
        seenOnceScenes: this.seenOnceScenes || [],
        reachedRestartPoints: this.reachedRestartPoints || [],
        investigationCompleted: this.investigationCompleted,
        lucasDialogueCompleted: this.lucasDialogueCompleted,
        lucasAvailable: this.lucasAvailable,
        nyomornegyed_decision: this.nyomornegyed_decision,
        lastUpdated: this.updatedAt,
      };
    }
  }

  GameSave.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      currentLocation: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Otthon',
      },
      currentSceneIds: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      discoveredLocations: {
        type: DataTypes.JSONB,
        defaultValue: ['Otthon'],
      },
      gameFlags: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      collectedItems: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      seenOnceScenes: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      reachedRestartPoints: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      investigationCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      lucasDialogueCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      lucasAvailable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      nyomornegyed_decision: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'accepted_help',
      },
    },
    {
      sequelize,
      modelName: 'GameSave',
      tableName: 'game_saves',
      underscored: true,
      timestamps: true,
    }
  );

  return GameSave;
};

