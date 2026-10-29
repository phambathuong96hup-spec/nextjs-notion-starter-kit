import { siteConfig } from './lib/site-config'

export default siteConfig({
  // 1. ID trang Notion gốc của bạn
  rootNotionPageId: '2a20bc1073c281d2ad70c499471b4760',

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
  navigationStyle: 'default'
})
