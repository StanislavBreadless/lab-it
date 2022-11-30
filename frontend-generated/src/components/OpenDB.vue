<template>
    <div class="open-db-wrapper">
        <input class="enter-db-name" v-model="dbName">
        <div class="db-button-wrapper">
            <button class="db-button" @click="openDb">Open</button>
            <button class="db-button" @click="createDb">Create</button>
        </div>
    </div>
  </template>
  
  <script lang="ts">
  import Vue from 'vue';
  
  export default Vue.extend({
    name: 'HelloWorld',
    props: {
      msg: String,
    },
    data() {
        return {
            dbName: ''
        }
    },
    methods: {
        openDb() {
            this.$emit('openDb', this.dbName);
        },
        createDb() {
            this.$emit('createDb', this.dbName);
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

  .open-db-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 200px;
    align-items: center;
  }
  .enter-db-name {
    width: 200px;
  }

  .db-button {
    width: 60px;
    margin-top: 20px;
  }

  .db-button-wrapper {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    flex-direction: column;
  }
  </style>
  