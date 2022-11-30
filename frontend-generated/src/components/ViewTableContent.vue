<template>
    <div class="open-db-wrapper">
        <h2>Table content</h2>
        <p>Db name: {{dbInfo.name}}</p>
        <p>Db id: {{dbInfo.id}}</p>
        <p>Table name: {{tableInfo.name}}</p>
        <p>Table id: {{tableInfo.id}}</p>

        <div class="db-actions">
            Table actions:
            <div>
                <p>1. View table data:</p>
                <table>
                    <tr>
                        <th>UUID</th>
                        <th v-for="column in tableInfo.columns">{{column.name}}</th>
                    </tr>
                    <tr v-for="row in tableData.data">
                        <td>{{row.rowId}}</td>
                        <td v-for="cellValue in row.data">{{cellValue ? cellValue : 'null'}}</td>
                    </tr>
                </table>
            </div>
            <div>
                <p>2. Delete this table</p>
                <button @click="deleteThisTable">Delete this table</button>
            </div>
            <div>
                <p>3. Add a row</p>
                <ul class="type-list">
                    <li v-for="col,index in tableInfo.columns">
                        <div>
                        {{col.name}} ( {{col.type}} ): 
                            <input v-model="addRowValues[index]" v-if="!textareaTypes.includes(col.type)"/>
                            <textarea v-model="addRowValues[index]" v-else></textarea>
                        </div>
                    </li>
                </ul>
                <button @click="addRow">Add a row to the table</button>
            </div>
            <div>
                <p>4. Delete a row</p>
                <input v-model="deleteRowUUID"/>
                <button @click="deleteRow">Delete a row from the table</button>
            </div>
            <div>
                <p>5. Edit a row</p>
                <select name="column" v-model="columnToEdit">
                    <option v-for="col in tableInfo.columns">{{col.name}}</option>
                </select>
                <br/>
                <label>Row UUID:</label>
                <input v-model="editRowUUID"/>
                <br/>
                <label>New value UUID:</label>
                <input v-model="editRowValue"/>
                <br/>

                <button @click="editRow">Edit a row in the table</button>
            </div>
            <div> 
                <p>6. Edit table metadata</p>
                <button @click="editMeta">Edit metadata</button>
            </div>
        </div> 
    </div>
  </template>
  
  <script lang="ts">
  import { DatabaseMeta, TableMetadata, ColumnType, RowData, TableData } from '@/backend-types';
import Vue from 'vue';

function columnTypes(): ColumnType[] {
    const ans:ColumnType[] = [];
    for(const type in ColumnType) {
        //@ts-ignore
        ans.push(type);
    }

    return ans;
}

interface ElemValue {
    value: string
}
const addRowValues: string[] = [];
  export default Vue.extend({
    name: 'HelloWorld',
    props: {
      dbInfo: DatabaseMeta,
      tableId: String,
      tableData: TableData
    },
    data() {
        const tableInfo = this.dbInfo!.tables.find(t => t.id === this.tableId)!;
        while(tableInfo.columns.length > addRowValues.length){
            addRowValues.push('');
        }

        return {
            newTableName: '',
            newColumnName: '',
            editMetaTableName: '',
            newColumnType: '',
            colTypes: columnTypes(),
            editColumnSelected: '',
            newEditedColumnName: '',
            deleteColumnSelected: '',
            tableInfo,
            addRowValues:addRowValues,
            deleteRowUUID: '',
            editRowUUID: '',
            columnToEdit: '',
            editRowValue: '',
            textareaTypes: [ColumnType.HtmlFile]
        }
    },
    watch: {

    },
    methods: {
        deleteThisTable() {
            this.$emit('deleteTable');
        },  
        addRow() {
            console.log('add row vals: ', this.addRowValues);
            try {
                const addvals = [...this.addRowValues].slice(0, this.tableInfo.columns.length).map((val, index) => {
                    if(this.tableInfo.columns[index].type == ColumnType.StringInvl) {
                        const vals = val.split(';');
                        if (vals.length < 3) {
                            throw new Error('Format of string interval should be l;r;str');
                        }

                        const l = vals[0];
                        const r = vals[1];
                        if(!l || !r) {
                            throw new Error('Invalid borders of string interval');
                        }
                        // the rest of the data is str itself
                        const str = vals.slice(2).join(';');

                        return JSON.stringify({ 
                            l, r, str
                        })
                    } else {
                        return val;
                    }
                });
                this.$emit('addRow', addvals);
            } catch(e){ alert(e); return; }
        },
        deleteRow() {
            this.$emit('deleteRow', this.deleteRowUUID);
        },
        editRow() {
            const column = this.tableInfo.columns.find(col => col.name == this.columnToEdit);

            if(!column) {
                alert('Wrong column set');
                return;
            }

            this.$emit('editRow', this.editRowUUID, column.id, this.editRowValue);
        },
        editMeta() {
            this.$emit('editMeta');
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

  .type-list {
    display: flex;
    flex-direction: column;
  }
  </style>
  