import { siteConfig } from './lib/site-config'

export default siteConfig({
  // 1. ID trang Notion gốc: CẢNH GIÁC DƯỢC
  rootNotionPageId: '2a20bc1073c2819cafbcceb1083418b3',

  rootNotionSpaceId: null,

  // 2. Thông tin hiển thị của trang
  name: 'TTYT Thanh Ba - Cảnh giác Dược',
  domain: 'canhgiacduoc-tbmedicare.vercel.app',
  author: 'Khoa Dược - Trung tâm Y tế Thanh Ba',

  // 3. Mô tả tóm tắt (SEO & Chia sẻ link Zalo/Facebook)
  description: 'Cổng thông tin thuốc, phác đồ và cảnh giác dược trực tuyến - Trung tâm Y tế Thanh Ba',

  // 4. Ảnh đại diện mặc định
  defaultPageIcon: null,
  defaultPageCover: null,
  defaultPageCoverPosition: 0.5,

  // 5. Tối ưu tốc độ build Vercel
  isPreviewImageSupportEnabled: false,
  isRedisEnabled: false,

  // 6. Kiểu menu điều hướng
  navigationStyle: 'default',

  // 7. Cấu hình 3 mục riêng biệt
  pageUrlOverrides: {
    '/khuyen-cao': '2a20bc1073c2819cafbcceb1083418b3',
    '/thu-hoi': '2a20bc1073c281f6a13aeb54b7201b56',
    '/tap-huan': '2a20bc1073c28135ab64ea3b1f61a8f5'
  }
})
