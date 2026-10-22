/** 顶栏那行"歌名"，由当前视图写入。 */
import { ref } from 'vue';

const pageTitle = ref('');

export const usePageTitle = () => ({
  pageTitle,
  setPageTitle: (value) => { pageTitle.value = value ?? ''; },
});
