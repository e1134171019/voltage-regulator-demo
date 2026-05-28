/**
 * scene03SharedState.js
 * 从 Scene03InteractiveBreadboard.vue 提取的共享状态和计算函数
 * 用于 SceneNodeViewer 复用 Scene03 的电路计算和初始化
 */

/**
 * 构建默认的运行时状态 - 完整的电路配置
 */
export function buildDefaultRuntimeState() {
  return {
    vin: 12,
    loadCurrent: 0.3,
    meterReadMode: 'voltage',
    partPlacements: {
      'zener-1': {
        templateId: 'zener',
        holes: { connector0: '10S', connector1: '10M' },
        freePosition: null,
        rotation: 270,
      },
      'ua741-9': {
        templateId: 'ua741',
        holes: {
          connector0: '21L',
          connector1: '23L',
          connector2: '25L',
          connector3: '27L',
          connector4: '27H',
          connector5: '25H',
          connector6: '23H',
          connector7: '21H',
        },
        freePosition: null,
        rotation: 0,
      },
      'rb-10': {
        templateId: 'rb',
        holes: { connector0: '10K', connector1: '10H' },
        freePosition: null,
        rotation: 270,
      },
      'npn-11': {
        templateId: 'npn',
        holes: { connector0: '40G', connector1: '42G', connector2: '44G' },
        freePosition: null,
        rotation: 0,
      },
      'r2-13': {
        templateId: 'r2',
        holes: { connector0: '32R', connector1: '32O' },
        freePosition: null,
        rotation: 270,
      },
      'supply-14': {
        templateId: 'supply',
        holes: {},
        freePosition: { x: -98.6158109213909, y: 244.17395485061576 },
        rotation: 270,
      },
      'supply-15': {
        templateId: 'supply',
        holes: {},
        freePosition: { x: 416.4088592036236, y: 309.51232590519754 },
        rotation: 180,
      },
      'meter-16': {
        templateId: 'meter',
        holes: {},
        freePosition: { x: 620.4771861944973, y: 306.72290486419803 },
        rotation: 270,
      },
      'rb-17': {
        templateId: 'rb',
        holes: { connector0: '40P', connector1: '40M' },
        freePosition: null,
        rotation: 270,
      },
    },
    wires: [
      { id: 'user-1', from: '', to: '1topRed', color: '#2563eb', width: 3.1 },
      { id: 'user-2', from: '', to: '1bottomBlue', color: '#2563eb', width: 3.1 },
      { id: 'user-3', from: '', to: '6bottomBlue', color: '#2563eb', width: 3.1 },
      { id: 'user-4', from: '', to: '55topBlue', color: '#2563eb', width: 3.1 },
      { id: 'user-22', from: '10topRed', to: '10H', color: '#2563eb', width: 3.1 },
      { id: 'user-23', from: '10bottomBlue', to: '10M', color: '#2563eb', width: 3.1 },
      { id: 'user-41', from: '21H', to: '10S', color: '#2563eb', width: 3.1 },
      { id: 'user-42', from: '27L', to: '10M', color: '#2563eb', width: 3.1 },
      { id: 'user-3', from: '', to: '6bottomBlue', color: '#2563eb', width: 3.1 },
      { id: 'user-4', from: '', to: '55topBlue', color: '#2563eb', width: 3.1 },
      { id: 'user-5', from: '1topRed', to: '10K', color: '#2563eb', width: 3.1 },
      { id: 'user-6', from: '10S', to: '21L', color: '#2563eb', width: 3.1 },
      { id: 'user-7', from: '10M', to: '27L', color: '#2563eb', width: 3.1 },
      { id: 'user-8', from: '23L', to: '10K', color: '#2563eb', width: 3.1 },
      { id: 'user-9', from: '27H', to: '40G', color: '#2563eb', width: 3.1 },
      { id: 'user-10', from: '40M', to: '32O', color: '#2563eb', width: 3.1 },
      { id: 'user-11', from: '40P', to: '21H', color: '#2563eb', width: 3.1 },
      { id: 'user-12', from: '32R', to: '23L', color: '#2563eb', width: 3.1 },
      { id: 'user-13', from: '25L', to: '1topRed', color: '#2563eb', width: 3.1 },
      { id: 'user-14', from: '25H', to: '6bottomBlue', color: '#2563eb', width: 3.1 },
    ],
  }
}

/**
 * 计算电路模型和各节点电压
 */
export function calculateCircuitModel(vin = 12, loadCurrent = 0.3) {
  // 定值器参考电压模型
  const zenerVoltage = 6.2
  const zenerCurrentLim = 1000 // 1k 限流电阻
  
  // 反馈分压网络
  const feedbackDivider = 10000 // 10k 反馈电阻
  
  // 计算 Vref（齐纳稳压点）
  const vref = vin > 6.7 ? zenerVoltage : Math.max(0, vin - 0.45)
  
  // 计算 Vplus（运放同相输入）= Vref
  const vplus = vref
  
  // 计算 Vminus（运放反相输入）= 反馈分压
  const feedbackCurrent = loadCurrent / 55 // 降压倍率约 55
  const vminus = (vref * feedbackDivider) / (feedbackDivider + 10000)
  
  // 运放误差
  const error = vplus - vminus
  
  // 运放输出
  const opAmpGain = 3.6
  const opAmpOut = 4.2 + error * opAmpGain
  const opAmpOutClamped = Math.min(Math.max(opAmpOut, 0), vin - 0.5)
  
  // BJT 基极电流
  const bjt_hFE = 55
  const bjt_vbe = 0.6
  const bjt_vc = opAmpOutClamped
  const bjt_ib = loadCurrent / bjt_hFE
  
  // 输出电压 Vout
  const vout = (vin - bjt_vbe) * (1 - bjt_ib * bjt_hFE / (vin * 10)) // 简化计算
  
  // 齐纳电流
  const zenerCurrent = Math.max((vin - vref) / zenerCurrentLim - feedbackCurrent, 0)
  
  return {
    vin,
    vref,
    vplus,
    vminus,
    error,
    opAmpOut: opAmpOutClamped,
    vout: Math.max(vout, vref),
    zenerCurrent,
    bjt_ib: Math.max(bjt_ib, 0),
    loadCurrent,
  }
}

/**
 * 获取指定节点的测量值
 */
export function getMeasurementValue(nodeId, circuitModel) {
  const nodeMap = {
    vref: () => circuitModel.vref,
    vplus: () => circuitModel.vplus,
    vminus: () => circuitModel.vminus,
    opAmpOut: () => circuitModel.opAmpOut,
    vout: () => circuitModel.vout,
    zenerCurrent: () => circuitModel.zenerCurrent,
  }
  
  const fn = nodeMap[nodeId]
  return fn ? fn() : 0
}

/**
 * 获取元件在麻布板上的位置（简化版）
 */
export function getPartPositions() {
  return {
    'zener-1': { x: 100, y: 100, connector0: { x: 110, y: 100 }, connector1: { x: 110, y: 120 } },
    'rb-10': { x: 100, y: 150, connector0: { x: 110, y: 150 }, connector1: { x: 110, y: 170 } },
    'ua741-9': { x: 200, y: 150, connectors: {} },
    'npn-11': { x: 300, y: 200, connectors: {} },
    'r2-13': { x: 300, y: 300, connectors: {} },
    'supply-14': { x: -50, y: 100, connectors: {} },
    'supply-15': { x: 400, y: 300, connectors: {} },
    'meter-16': { x: 600, y: 300, connectors: {} },
    'rb-17': { x: 300, y: 350, connectors: {} },
  }
}
