<template>
    <div class="warning-message">Are you sure you want to delete this account? All your information will be deleted!</div>
    <button type="button" class="btn btn-primary confrim-frist" data-bs-toggle="modal" data-bs-target="#exampleModal">
        Confirm deletion
    </button>

    <!-- Modal -->
    <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">Second confirmation</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body warning-message">
                    Please confirm again! Deleted accounts cannot be recovered!
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button data-bs-dismiss="modal" v-on:click="delete_account" class="btn btn-primary confrim-second">Confirm deletion</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "DeleteAccount",
    setup(props, context) {
        const delete_account = () => {
            context.emit('delete_account');
        }

        return {
            delete_account,
        }
    }
}
</script>

<style scoped>
.warning-message {
    color: red;
}

.confrim-frist {
    margin-top: 15px;
}
</style>