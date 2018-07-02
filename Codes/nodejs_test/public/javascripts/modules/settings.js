new Vue({
    components: {
        Multiselect: window.VueMultiselect.default
    },
    data: {
        options: [

        ],
        optionsProxy: [],
        selectedResources: [],
        showLoadingSpinner: false
    },
    methods: {
        customLabel (option) {
            return `${option.name} - ${option.version}`
        },
        updateSelected(value) {
            value.forEach((resource) => {
                // Adds selected resources to array
                this.selectedResources.push(resource)
            })
            // Clears selected array
            // This prevents the tags from being displayed
            this.optionsProxy = []
        },
        cdnRequest(value) {
            this.$http.get(`https://api.cdnjs.com/libraries?search=${value}&fields=version,description`).then((response) => {
                // get body data
                this.options = []
                response.body.results.forEach((object) => {
                    this.options.push(object)
                });
                this.showLoadingSpinner = false
            }, (response) => {
                // error callback
            })
        },
        searchQuery(value) {
            this.showLoadingSpinner = true
            // GET
            this.cdnRequest(value)
        },
        removeDependency(index) {
            this.selectedResources.splice(index, 1)
        }
    },
    created() {
        const value = ''
        this.cdnRequest(value)
    }
}).$mount('#app')