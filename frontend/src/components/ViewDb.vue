<template>
    <div class="open-db-wrapper">
        <p>Db name: {{dbInfo.name}}</p>
        <p>Db id: {{dbInfo.id}}</p>
        <div class="db-actions">
            <p>Db actions:</p>
            <div>
                <p>1. Edit DB name</p>
                <input v-model="newDbName">
                <button @click="changeDbName">Change!</button>
            </div>
            <div>
                <p>2. Delete this DB</p>
                <button @click="deleteDb">Delete this db</button>
            </div>
            <div>
                <p>3. Add table</p>
                <input v-model="newTableName">
                <button @click="addTable">Add table</button>
            </div>
            <div>
                <p>4. Edit table metadata</p>
                <select name="table" v-model="editMetaTableName">
                    <option v-for="table in dbInfo.tables">{{table.name}}</option>
                </select>
                <button @click="editTableMeta">Edit table meta</button>
            </div>
            <div>
                5. Open table
            </div>
            <div>
                6. Delete table
            </div>
            <div>
                7. Find table intersection
            </div>
        </div>
    </div>
  </template>
  
  <script lang="ts">
  import { DatabaseMeta } from '@/backend-types';
import Vue from 'vue';
  
  export default Vue.extend({
    name: 'HelloWorld',
    props: {
      dbInfo: DatabaseMeta
    },
    data() {
        return {
            newDbName: '',
            newTableName: '',
            editMetaTableName: ''
        }
    },
    methods: {
        changeDbName() {
            this.$emit('changeDbName', this.newDbName);
        },
        deleteDb() {
            this.$emit('deleteDb')
        },
        addTable() {
            this.$emit('addTable', this.newTableName);
        },
        editTableMeta() {
            this.$emit('editTableMeta', this.editMetaTableName);
        }
    }
  });
  </script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
  <style scoped>
  h3 {
    margin: 40px 0 0;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    display: inline-block;
    margin: 0 10px;
  }
  a {
    color: #42b983;
  }
  </style>
  