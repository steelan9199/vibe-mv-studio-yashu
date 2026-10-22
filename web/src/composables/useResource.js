/** 统一的"读一次接口"生命周期：loading / error / data，视图不再各写一遍。 */
import { onMounted, ref, shallowRef } from 'vue';

export function useResource(loader, { immediate = true } = {}) {
  const data = shallowRef(null);
  const error = ref(null);
  const loading = ref(false);

  const load = async (...args) => {
    loading.value = true;
    error.value = null;
    try {
      data.value = await loader(...args);
    } catch (err) {
      error.value = err.message ?? String(err);
    } finally {
      loading.value = false;
    }
  };

  if (immediate) onMounted(load);

  return { data, error, loading, load };
}
