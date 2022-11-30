<template>
    <div class="open-db-wrapper">
        <h2>Table intersection</h2>
        <p>Db name: {{dbInfo.name}}</p>
        <p>Db id: {{dbInfo.id}}</p>
        <p>Table 1 name: {{tableInfo1.name}}</p>
        <p>Table 1 id: {{tableInfo1.id}}</p>
        <p>Table 2 name: {{tableInfo2.name}}</p>
        <p>Table 2 id: {{tableInfo2.id}}</p>

        <div class="db-actions">
            Table actions:
            <div>
                <p>1. View tables' intersection:</p>
                <table v-if="intersectionData && intersectionData.data && intersectionData.data.length !== 0">
                    <tr>
                        <th>UUID</th>
                        <th v-for="column in tableInfo1.columns">{{column.name}}</th>
                    </tr>
                    <tr v-for="row in intersectionData.data">
                        <td>{{row.rowId}}</td>
                        <td v-for="cellValue in row.data">{{cellValue ? cellValue : 'null'}}</td>
                    </tr>
                </table>
                <div v-else><b>Tables' intersection is empty</b></div>
            </div>
            <div>
                <p>2. ReturnToViewDb</p>
                <button @click="returnToViewDb">Return to viewing the database</button>
            </div>
        </div> 
    </div>
  </template>
  
  <script lang="ts">
  import { DatabaseMeta, TableMetadata, ColumnType, RowData, TableData } from '@/backend-types';
import Vue from 'vue';

  export default Vue.extend({
    name: 'HelloWorld',
    props: {
      dbInfo: DatabaseMeta,
      tableId1: String,
      tableId2: String,
      intersectionData: TableData
    },
    data() {
        const tableInfo1 = this.dbInfo!.tables.find(t => t.id === this.tableId1)!;
        const tableInfo2 = this.dbInfo!.tables.find(t => t.id === this.tableId2)!;


        return {
            tableInfo1,
            tableInfo2
        }
    },

    methods: {
        returnToViewDb() {
            this.$emit('returnToViewDb');
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
  