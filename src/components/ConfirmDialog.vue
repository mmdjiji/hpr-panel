<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    @close="handleClose"
  >
    <div class="confirm-content">
      <el-icon v-if="showIcon" :class="['confirm-icon', iconType]">
        <component :is="iconComponent" />
      </el-icon>
      <div class="confirm-message">
        <div v-if="message" v-html="message"></div>
        <slot></slot>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel" :disabled="loading">{{ cancelText }}</el-button>
        <el-button 
          type="primary" 
          @click="handleConfirm" 
          :loading="loading"
        >
          {{ confirmText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { ref, computed, defineComponent } from 'vue'
import { Warning, InfoFilled, QuestionFilled } from '@element-plus/icons-vue'

export default defineComponent({
  name: 'ConfirmDialog',
  components: {
    Warning,
    InfoFilled,
    QuestionFilled
  },
  props: {
    title: {
      type: String,
      default: '确认'
    },
    message: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'warning',
      validator: (value) => ['warning', 'info', 'error', 'success', 'question'].includes(value)
    },
    confirmText: {
      type: String,
      default: '确认'
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    width: {
      type: String,
      default: '420px'
    },
    showIcon: {
      type: Boolean,
      default: true
    },
    closeOnClickModal: {
      type: Boolean,
      default: false
    },
    closeOnPressEscape: {
      type: Boolean,
      default: true
    }
  },
  emits: ['confirm', 'cancel', 'close', 'update:visible'],
  setup(props, { emit }) {
    const visible = ref(false)
    const loading = ref(false)

    const iconComponent = computed(() => {
      switch (props.type) {
        case 'warning':
        case 'error':
          return Warning
        case 'info':
        case 'success':
          return InfoFilled
        case 'question':
          return QuestionFilled
        default:
          return Warning
      }
    })

    const iconType = computed(() => {
      return `is-${props.type}`
    })

    const handleConfirm = () => {
      emit('confirm')
    }

    const handleCancel = () => {
      emit('cancel')
      visible.value = false
      emit('update:visible', false)
    }

    const handleClose = () => {
      emit('close')
      visible.value = false
      emit('update:visible', false)
    }

    const open = () => {
      visible.value = true
    }

    const close = () => {
      visible.value = false
      emit('update:visible', false)
    }

    const startLoading = () => {
      loading.value = true
    }

    const stopLoading = () => {
      loading.value = false
    }

    return {
      visible,
      loading,
      iconComponent,
      iconType,
      handleConfirm,
      handleCancel,
      handleClose,
      open,
      close,
      startLoading,
      stopLoading
    }
  }
})
</script>

<style scoped>
.confirm-content {
  display: flex;
  align-items: flex-start;
  padding: 10px 0;
}

.confirm-icon {
  font-size: 24px;
  margin-right: 12px;
}

.confirm-icon.is-warning {
  color: #e6a23c;
}

.confirm-icon.is-error {
  color: #f56c6c;
}

.confirm-icon.is-info {
  color: #909399;
}

.confirm-icon.is-success {
  color: #67c23a;
}

.confirm-icon.is-question {
  color: #409eff;
}

.confirm-message {
  flex: 1;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>