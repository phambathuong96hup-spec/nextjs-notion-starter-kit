import { NotionAPI } from 'notion-client'

export const notion = new NotionAPI({
  apiBaseUrl: process.env.NOTION_API_BASE_URL
})

// Tự động sửa lỗi Notion API 400 khi Database View có bật tính năng Group By (Nhóm)
const origGetCollectionData = notion.getCollectionData.bind(notion)
;(notion as any).getCollectionData = async function (
  collectionId: string,
  collectionViewId: string,
  collectionView?: any,
  options?: any
) {
  try {
    return await origGetCollectionData(
      collectionId,
      collectionViewId,
      collectionView,
      options
    )
  } catch (err) {
    try {
      const sanitizedView = {
        ...collectionView,
        format: {
          ...collectionView?.format,
          collection_group_by: undefined,
          collection_groups: undefined,
          board_columns_by: undefined,
          board_columns: undefined
        }
      }
      return await origGetCollectionData(
        collectionId,
        collectionViewId,
        sanitizedView,
        options
      )
    } catch {
      throw err
    }
  }
}
