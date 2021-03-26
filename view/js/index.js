

var nowStr = Date.now() + ''

new Vue({
  el: '#app',
  data: {
    updateRange: 1,
    tableData: [],
    currentPage: 1,
    pageSize: 10,
    task: '',
  },
  computed: {
    tableDataChunk: function () {
      var offset = this.pageSize * (this.currentPage - 1)
      return this.tableData.slice(offset, offset + this.pageSize)
    }
  },
  watch: {
  },
  filters: {
    dataFormat: function (date) {
      return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  created: function () {
  },
  methods: {
    getUndownloadList: function () {
      var that = this

      axios
        .get('/getUndownloadList')
        .then(function (res) {
          var data = res.data
          if (data.success) {
            that.tableData = data.data
            that.currentPage = 1
            this.task = 'getUndownloadList'
          }
        })
    },
    getUnUpateUserList: function () {
      var that = this

      axios
        .get('/getUnUpateUserList?range=' + this.updateRange)
        .then(function (res) {
          var data = res.data
          if (data.success) {
            that.tableData = data.data
            that.currentPage = 1
            this.task = 'getUnUpateUserList'
          }
        })
    },
  }
})
