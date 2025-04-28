import { LoadingOutlined } from "@ant-design/icons"
import { Spin } from "antd"

export default function Loading() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
      <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      <p style={{ marginLeft: 16, color: "#595959" }}>Loading course details...</p>
    </div>
  )
}
