<template>
    <div class="open-db-wrapper">
        <h2>Table meta</h2>
        <p>Db name: {{dbInfo.name}}</p>
        <p>Db id: {{dbInfo.id}}</p>
        <p>Table name: {{tableInfo.name}}</p>
        <p>Table id: {{tableInfo.id}}</p>

        <div class="db-actions">
           <p>Table meta actions:</p>
            <div>
                <p>1. Edit Table name</p>
                <input v-model="newTableName">
                <button @click="changeTableName">Change!</button>
            </div>
            <div>
                <p>2. Add column</p>
                <input v-model="newColumnName">
                <select name="column-type" v-model="newColumnType">
                    <option v-for="colType in colTypes">{{colType}}</option>
                </select>
                <button @click="addNewColumn">Add column</button>
            </div>
            <div>
                <p>3. Edit column name</p>
                <select name="column" v-model="editColumnSelected">
                    <option v-for="col in tableInfo.columns">{{col.name}}</option>
                </select>
                <input v-model="newEditedColumnName">
                <button @click="editColumnName">Edit column name</button>
            </div>
            <div>
                <p>4. Delete column</p>
                <select name="column" v-model="deleteColumnSelected">
                    <option v-for="col in tableInfo.columns">{{col.name}}</option>
                </select>
                <button @click="deleteColumn">Delete column</button>
            </div>
            <div>
                5. View table's content
                <button @click="viewTablesContent">View content</button>
            </div>
        </div> 
    </div>
  </template>
  
  <script lang="ts">
  import { DatabaseMeta, TableMetadata, ColumnType } from '@/backend-types';
import Vue from 'vue';

function columnTypes(): ColumnType[] {
    const ans:ColumnType[] = [];
    for(const type in ColumnType) {
        //@ts-ignore
        ans.push(type);
    }

    return ans;
}
  
  export default Vue.extend({
    name: 'HelloWorld',
    props: {
      dbInfo: DatabaseMeta,
      tableId: String,
    },
    data() {
        return {
            newTableName: '',
            newColumnName: '',
            editMetaTableName: '',
            newColumnType: '',
            colTypes: columnTypes(),
            editColumnSelected: '',
            newEditedColumnName: '',
            deleteColumnSelected: '',
            tableInfo: this.dbInfo.tables.find(t => t.id === this.tableId)!
        }
    },
    methods: {
        changeTableName() {
            this.$emit('changeTableName', this.newTableName);
        },
        addNewColumn() {
            console.log('addNewColumn');
            this.$emit('addNewColumn', this.newColumnName, this.newColumnType);
        },
        editColumnName() {
            this.$emit('editColumnName', this.editColumnSelected, this.newEditedColumnName);
        },
        deleteColumn() {
            this.$emit('deleteColumn', this.deleteColumnSelected);
        },
        viewTablesContent() {
            this.$emit('viewTablesContent');
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
  