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
                <p>5. Open table</p>
                <select name="table" v-model="openTableContentName">
                    <option v-for="table in dbInfo.tables">{{table.name}}</option>
                </select>
                <button @click="openTableContent">Open table content</button>
            </div>
            <div>
                <p>6. Delete table</p>
                <select name="table" v-model="deleteTableName">
                    <option v-for="table in dbInfo.tables">{{table.name}}</option>
                </select>
                <button @click="openTableContent">Open table content</button>
            </div>
            <div>
                <p>7. Find table intersection</p>
                <select name="table" v-model="comp1Name">
                    <option v-for="table in dbInfo.tables">{{table.name}}</option>
                </select>
                <select name="table" v-model="comp2Name">
                    <option v-for="table in dbInfo.tables">{{table.name}}</option>
                </select>
                <button @click="findTableIntersection">Find!</button>
            </div>
            <div>
                <p>8. Open HTML blob</p>
                <input v-model="htmlBlobId">
                <button @click="openBlob">Open!</button>
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
            editMetaTableName: '',
            openTableContentName: '',
            comp1Name: '',
            comp2Name: '',
            deleteTableName: '',
            htmlBlobId: ''
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
        },
        openTableContent() {
            this.$emit('openTableContent', this.openTableContentName);
        },
        deleteTable() {
            this.$emit('deleteTable', this.deleteTableName);
        },
        findTableIntersection() {
            this.$emit('findTableIntersection', this.comp1Name, this.comp2Name);
        },
        openBlob() {
            this.$emit('openBlob', this.htmlBlobId)
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
  