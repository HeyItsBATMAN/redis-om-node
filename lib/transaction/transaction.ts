import Client from "../client";
import Entity from '../entity/entity';
import Repository from '../repository/repository';

import { RedisClientMultiCommandType } from '@node-redis/client/dist/lib/client/multi-command';
import { RedisScripts, RedisModules } from '@node-redis/client/dist/lib/commands';

export default class Transaction {
  private multi;

  constructor(client: Client) {
    this.multi = client.multi();
  }

  add(repository: Repository<Entity>, entity: Entity) {
    const { key, data, dataStructure } = repository.prepareForTransaction(entity);
    dataStructure === 'JSON' ? this.multi.jsonset(key, data) : this.multi.hSet(key, data);
    return this;
  }

  exec() {
    return this.multi.exec();
  }
}
