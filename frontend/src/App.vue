<template>
  <div id="app">
    <OpenDB @openDb="openDb" @createDb="createDb" v-if="state == 'OpenDB'" />
    <ViewDb @findTableIntersection="findTableIntersection" @deleteTable="deleteTable" @openTableContent="viewTableContent" @editTableMeta="editTableMeta" @changeDbName="changeDbName" @deleteDb="deleteDb" @addTable="addTable" :dbInfo="dbInfo" v-else-if="state == 'ViewDb'" />
    <ViewTableMeta @viewTablesContent="viewCurrentTableContent" @deleteColumn="deleteColumn" @editColumnName="editColumnName" @addNewColumn="addNewColumn" @changeTableName="changeTableName" :dbInfo="dbInfo" :tableId="viewedTableId" v-else-if="state == 'ViewTableMeta'" />
    <ViewTable @deleteTable="deleteCurrentTable" @editMeta="editCurrentTableMeta" @editRow="editRowFromCurrentTable" @deleteRow="deleteRowFromCurrentTable" @addRow="addToRowToCurrentTable" :dbInfo="dbInfo" :tableId="viewedTableId" :tableData="tableData" v-else-if="state == 'ViewTable'" />
    <ViewIntersection @returnToViewDb="returnToViewDb" :tableId1="tableComp1Id" :tableId2="tableComp2Id" :intersectionData="tableIntersection" :dbInfo="dbInfo" v-else-if="state == 'ViewIntersection'" />
    <Loader v-else-if="state == 'Loader'" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import HelloWorld from './components/HelloWorld.vue';
import OpenDB from './components/OpenDB.vue';
import ViewDb from './components/ViewDb.vue';
import ViewTable from './components/ViewTableContent.vue';
import ViewIntersection from './components/ViewIntersection.vue';
import Loader from './components/Loader.vue';
import { ColumnType, DatabaseMeta, DataCell, TableData } from './backend-types';
import { addColumn, addRow, changeDbName, createDb, createNewTable, deleteColumn, deleteDb, deleteRow, deleteTable, editCellData, editColumnName, editTableName, getDbInfo, getDbInfoByName, getTableData, getTableIntersection } from './http';
import ViewTableMeta from './components/ViewTableMeta.vue';

type State = 'OpenDB' | 'Loader' | 'ViewDb' | 'ViewTable' | 'ViewIntersection' | 'ViewTableMeta';

interface FormState {
  state: State,
  dbInfo: DatabaseMeta|null,
  tableData: TableData|null,
  tableIntersection: TableData|null,
  tableComp1Id: string,
  tableComp2Id: string,
  viewedTableId: string
}

export default Vue.extend({
  name: 'App',
  data() {
    return {
      state: 'OpenDB',
      dbInfo: null,
      viewedTableId: '',
      tableData: null,
      tableIntersection: null,
      tableComp1Id: '',
      tableComp2Id: ''
    } as FormState
  },
  components: {
    HelloWorld,
    OpenDB,
    ViewDb,
    ViewTable,
    ViewIntersection,
    Loader,
    ViewTableMeta
},
methods: {

  async moveToViewDb() {
    try {

    } catch {

    }
  },

  async changeDbName(newName: string) {
    try {
      this.state = 'Loader';

      await changeDbName(this.dbInfo!.id, newName);
      this.dbInfo = await getDbInfo(this.dbInfo!.id);

      this.state = 'ViewDb';
    } catch(e) {
      alert(e);
      this.state = 'OpenDB';
    }
  },

  async deleteDb() {
    try {
      this.state = 'Loader';

      await deleteDb(this.dbInfo!.id);
      this.dbInfo = null;

      this.state = 'OpenDB';
    } catch(e) {
      alert(e);
      this.state = 'OpenDB';
    }
  },

  async addTable(tableName: string) {
    try {
      this.state = 'Loader';

      console.log('trableanme ', tableName);
      await createNewTable(this.dbInfo!.id, tableName);
      this.dbInfo = await getDbInfo(this.dbInfo!.id);
      console.log(this.dbInfo.tables);

      this.state = 'ViewDb';      
    } catch(e) {
      alert(e);
      this.state = 'ViewDb';
    }
  },

  async openDb(dbName: string) {
    try {
      this.state = 'Loader';

      this.dbInfo = await getDbInfoByName(dbName);

      this.state = 'ViewDb';
    } catch(e) {
      alert(e);
      this.state = 'OpenDB';
    }
  },

  async addNewColumn(columnName: string, columnType: ColumnType) {
    try { 
      console.log('hi');
      this.state = 'Loader';

      await addColumn(this.dbInfo!.id, this.viewedTableId, columnName, columnType);
      this.dbInfo = await getDbInfo(this.dbInfo!.id);
    
      this.state = 'ViewTableMeta'
    } catch(e) {
      alert(e);
      this.state ='ViewTableMeta';
    }
  },

  async editColumnName(oldColName: string, newColName: string) {
    try {
      this.state = 'Loader';
      const oldTableInfo = this.dbInfo!.tables.find(t => t.id === this.viewedTableId)!;
      const colId = oldTableInfo.columns.find(col => col.name == oldColName)!.id;

      await editColumnName(this.dbInfo!.id, this.viewedTableId, colId, newColName);
      this.dbInfo = await getDbInfo(this.dbInfo!.id);

      this.state = 'ViewTableMeta';
    } catch(e) {
      alert(e);
      this.state = 'ViewTableMeta';
    }
  },

  async deleteColumn(columnName: string) {
    try {
      this.state = 'Loader';
      const oldTableInfo = this.dbInfo!.tables.find(t => t.id === this.viewedTableId)!;
      const colId = oldTableInfo.columns.find(col => col.name == columnName)!.id;

      await deleteColumn(this.dbInfo!.id, this.viewedTableId, colId);
      this.dbInfo = await getDbInfo(this.dbInfo!.id);

      this.state = 'ViewTableMeta'; 
    } catch(e) {
      alert(e);
      this.state = 'ViewTableMeta';
    }
  },

  async createDb(dbName: string) {
    try {
      this.state = 'Loader';

      const dbId = await createDb(dbName);
      this.dbInfo = await getDbInfo(dbId);

      this.state = 'ViewDb';
    } catch(e) {
      alert(e);
      this.state = 'OpenDB';
    }
  },

  async changeTableName(newName: string) {
    try {
      this.state = 'Loader';

      await editTableName(this.dbInfo!.id, this.viewedTableId, newName);
      this.dbInfo = await getDbInfo(this.dbInfo!.id);

      this.state = 'ViewTableMeta';
    } catch(e) {
      alert(e);
      this.state = 'ViewTableMeta';
    }
  },

  async editTableMeta(tableName: string) {
    try {
      this.state = 'Loader';
      const selectedTableId = this.dbInfo!.tables.find(table => table.name == tableName)!;
      this.viewedTableId = selectedTableId.id;

      this.state = 'ViewTableMeta';
    } catch(e) {
      alert(e);
      this.state = 'ViewDb';
    }
  },

  async editCurrentTableMeta() {
    await this.editTableMeta(
      this.dbInfo!.tables.find(table => table.id == this.viewedTableId)!.name
    )
  },

  async viewCurrentTableContent() {
    try {
      this.state = 'Loader';
      this.tableData = await getTableData(this.dbInfo!.id, this.viewedTableId);

      console.log('TABLE DATA ', this.tableData);

      this.state = 'ViewTable';
    } catch(e) {
      alert(e);
      this.state = 'ViewDb';
    }
  },

  async viewTableContent(tableName: string) {
    try {
      this.state = 'Loader';
      const selectedTableId = this.dbInfo!.tables.find(table => table.name == tableName)!;
      this.viewedTableId = selectedTableId.id;

      this.tableData = await getTableData(this.dbInfo!.id, this.viewedTableId);

      this.state = 'ViewTable';
    } catch(e) {
      alert(e);
      this.state = 'ViewDb';
    }
  },

  async addToRowToCurrentTable(rowData: DataCell[]) {
    try {
      this.state = 'Loader';

      await addRow(this.dbInfo!.id,this.viewedTableId,rowData);
      this.tableData = await getTableData(this.dbInfo!.id, this.viewedTableId);

      this.state = 'ViewTable';
    } catch(e) {
      alert(e);
      this.state = 'ViewTable';
    }
  },

  async deleteRowFromCurrentTable(rowId: string) {
    try {
      this.state = 'Loader';

      await deleteRow(this.dbInfo!.id, this.viewedTableId, rowId);
      this.tableData = await getTableData(this.dbInfo!.id, this.viewedTableId);

      this.state = 'ViewTable';
    } catch(e) {
      alert(e);
      this.state = 'ViewTable';
    }
  },

  async editRowFromCurrentTable(rowId: string, colId: string, newVal: string) {
    try {
      this.state = 'Loader';
      
      console.log(`${rowId} ${colId} ${newVal}`);

      await editCellData(this.dbInfo!.id, this.viewedTableId, rowId, colId, newVal);
      this.tableData = await getTableData(this.dbInfo!.id, this.viewedTableId);

      this.state = 'ViewTable';
    } catch(e) {
      alert(e);
      this.state = 'ViewTable';
    }
  },

  async deleteTable(tableName: string) {
    try {
      this.state = 'Loader';
      
      const table = this.dbInfo!.tables.find(t => t.name == tableName)!;
      await deleteTable(this.dbInfo!.id, table.id);

      this.state = 'ViewDb'
    } catch(e) {
      alert(e);
      this.state = 'OpenDB'
    }
  },

  async deleteCurrentTable() {
    try {
      this.state = 'Loader';
      
      await deleteTable(this.dbInfo!.id, this.viewedTableId);
      this.dbInfo = await getDbInfo(this.dbInfo!.id);

      this.state = 'ViewDb'
    } catch(e) {
      alert(e);
      this.state = 'OpenDB'
    }
  },
  async findTableIntersection(comp1Name: string, comp2Name: string) {
    try {
      this.state = 'Loader';

      this.tableComp1Id = this.dbInfo!.tables.find(t => t.name == comp1Name)!.id;
      this.tableComp2Id = this.dbInfo!.tables.find(t => t.name == comp2Name)!.id;

      this.tableIntersection = await getTableIntersection(this.dbInfo!.id, this.tableComp1Id, this.tableComp2Id);

      console.log('A' ,this.tableIntersection);
      console.log('B', this.tableIntersection.data);
      console.log('C', this.tableIntersection.data.length);


      this.state = 'ViewIntersection'
    } catch(e) {
      alert(e);
      this.state = 'OpenDB'
    }
  },

  async returnToViewDb() {
    try {
      this.state = 'Loader';

      this.dbInfo = await getDbInfo(this.dbInfo!.id);

      this.state = 'ViewDb'
    } catch(e) {
      alert(e);
      this.state = 'OpenDB'
    }
  }
}

});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
