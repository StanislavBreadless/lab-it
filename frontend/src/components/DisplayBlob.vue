<template>
    <div v-html="html">
    </div>
</template>
  
  <script lang="ts">
  import { DatabaseMeta } from '@/backend-types';
import Vue from 'vue';
  
  export default Vue.extend({
    name: 'HelloWorld',
    props: {
        html: String
    },
    data() {
        return {

        }
    },
    methods: {
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
  