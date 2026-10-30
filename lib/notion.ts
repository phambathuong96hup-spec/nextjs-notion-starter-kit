import {
  type ExtendedRecordMap,
  type SearchParams,
  type SearchResults
} from 'notion-types'
import { mergeRecordMaps } from 'notion-utils'
import pMap from 'p-map'
import pMemoize from 'p-memoize'

import {
  isPreviewImageSupportEnabled,
  navigationLinks,
  navigationStyle
} from './config'
import { getTweetsMap } from './get-tweets'
import { notion } from './notion-api'
import { getPreviewImageMap } from './preview-images'

const getNavigationLinkPages = pMemoize(
  async (): Promise<ExtendedRecordMap[]> => {
    const navigationLinkPageIds = (navigationLinks || [])
      .map((link) => link?.pageId)
      .filter(Boolean)

    if (navigationStyle !== 'default' && navigationLinkPageIds.length) {
      return pMap(
        navigationLinkPageIds,
        async (navigationLinkPageId) =>
          notion.getPage(navigationLinkPageId, {
            chunkLimit: 1,
            fetchMissingBlocks: false,
            fetchCollections: false,
            signFileUrls: false
          }),
        {
          concurrency: 4
        }
      )
    }

    return []
  }
)

export async function getPage(pageId: string): Promise<ExtendedRecordMap> {
  let recordMap = await notion.getPage(pageId)

  // Tự động gộp các bài của Khuyến cáo cập nhật vào chung 1 bảng Cảnh giác dược
  try {
    const cleanId = (pageId || '').replace(/-/g, '')
    if (cleanId === '2a20bc1073c281d2ad70c499471b4760') {
      const kcRecordMap = await notion.getPage('2a20bc1073c2819cafbcceb1083418b3')
      recordMap = mergeRecordMaps(recordMap, kcRecordMap)

      const cgdColKeys = Object.keys(recordMap.collection_query || {})
      const kcColKeys = Object.keys(kcRecordMap.collection_query || {})

      if (cgdColKeys.length && kcColKeys.length) {
        const cgdColId = cgdColKeys[0]
        const kcColId = kcColKeys[0]
        const cgdViews = Object.keys(recordMap.collection_query[cgdColId] || {})
        const kcViews = Object.keys(kcRecordMap.collection_query[kcColId] || {})

        if (cgdViews.length && kcViews.length) {
          const cgdViewId = cgdViews[0]
          const kcViewId = kcViews[0]

          const cgdQuery = recordMap.collection_query[cgdColId][cgdViewId]
          const kcQuery = kcRecordMap.collection_query[kcColId][kcViewId]

          const cgdBlockIds =
            cgdQuery?.collection_group_results?.blockIds || cgdQuery?.blockIds || []
          const kcBlockIds =
            kcQuery?.collection_group_results?.blockIds || kcQuery?.blockIds || []

          const mergedIds = Array.from(new Set([...cgdBlockIds, ...kcBlockIds]))

          if (cgdQuery?.collection_group_results) {
            cgdQuery.collection_group_results.blockIds = mergedIds
            cgdQuery.collection_group_results.total = mergedIds.length
          }
          if (cgdQuery?.blockIds) {
            cgdQuery.blockIds = mergedIds
            cgdQuery.total = mergedIds.length
          }
        }
      }
    }
  } catch (err) {
    console.error('Lỗi khi gộp Khuyến cáo vào Cảnh giác dược:', err)
  }

  // 1. Tự động lấy tên Collection làm tiêu đề trang nếu block là collection_view
  const firstBlockKey = Object.keys(recordMap?.block || {})[0]
  if (firstBlockKey) {
    const rawBlock = recordMap.block[firstBlockKey]
    const blockVal = (rawBlock as any)?.value?.value || (rawBlock as any)?.value
    if (
      blockVal &&
      (blockVal.type === 'collection_view' ||
        blockVal.type === 'collection_view_page')
    ) {
      const colId = blockVal.collection_id
      const col =
        (recordMap.collection?.[colId] as any)?.value?.value ||
        (recordMap.collection?.[colId] as any)?.value
      if (col?.name) {
        blockVal.properties = {
          ...blockVal.properties,
          title: col.name
        }
      }
      // Ẩn tiêu đề trùng lặp bên trong collection header
      if (!blockVal.format) blockVal.format = {}
      blockVal.format.hide_inline_collection_name = true
    }
  }

  // 2. Sửa lỗi Notion Database View có bật Group By và ẩn tiêu đề lặp lại
  if (recordMap.collection_view) {
    for (const cv of Object.values(recordMap.collection_view)) {
      const val = (cv as any)?.value?.value || (cv as any)?.value
      if (val?.format?.collection_group_by) {
        delete val.format.collection_group_by
      }
      if (val?.format?.board_columns_by) {
        delete val.format.board_columns_by
      }
      if (val?.format) {
        val.format.hide_linked_collection_name = true
      }
    }
  }

  if (navigationStyle !== 'default') {
    // ensure that any pages linked to in the custom navigation header have
    // their block info fully resolved in the page record map so we know
    // the page title, slug, etc.
    const navigationLinkRecordMaps = await getNavigationLinkPages()

    if (navigationLinkRecordMaps?.length) {
      recordMap = navigationLinkRecordMaps.reduce(
        (map, navigationLinkRecordMap) =>
          mergeRecordMaps(map, navigationLinkRecordMap),
        recordMap
      )
    }
  }

  if (isPreviewImageSupportEnabled) {
    const previewImageMap = await getPreviewImageMap(recordMap)
    ;(recordMap as any).preview_images = previewImageMap
  }

  await getTweetsMap(recordMap)

  return recordMap
}

export async function search(params: SearchParams): Promise<SearchResults> {
  return notion.search(params)
}
