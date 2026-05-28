/**
 * 节点查看器配置
 * 定义每个教学节点要显示、高亮的元件和线路
 * IDs 对应 buildDefaultRuntimeState() 中的实际 part 和 wire IDs
 */

export const SCENE_CONFIGS = {
  // ① 节点1：V_Z（Zener 产生 6.2V 参考）
  node1_vref: {
    title: '① 節點 1 — V_Z (ZD 陰極)',
    explanation: '先接 1kΩ 限流電阻與 ZD，通電確認 V_Z ≈ 6.2V。這是整個電路的電壓基準。',
    expectedValue: { voltage: '≈ 6.2', unit: 'V' },
    electronFlow: ['+Vcc', '1kΩ', 'ZD 陰極', 'GND'],
    
    visibleParts: [
      'zener-1',    // Zener 二极管
      'rb-10',      // 1k 限流电阻
      'supply-14',  // +Vcc 电源
      'supply-15',  // GND 电源
    ],
    
    visibleWires: [
      'user-1',     // +Vcc to breadboard 1topRed
      'user-2',     // GND to breadboard 1bottomBlue
      'user-22',    // 10topRed → 10H (1k 上端，连接 ZD 上端)
      'user-23',    // 10T → 10bottomBlue (1k 下端连 GND)
      'user-41',    // 1topRed 连到 supply-14 (+Vcc)
      'user-42',    // 1bottomBlue 连到 supply-14 (GND)
      'user-43',    // 1bottomBlue 连到 supply-15 (GND)
      'user-44',    // supply-15 (+Vcc) 连到 63topBlue
    ],
    
    highlightParts: [
      'zener-1',
      'rb-10',
    ],
    
    highlightWires: [
      'user-22',
      'user-23',
    ],
    
    meterTarget: { nodeId: 'vref' },
  },

  // ② 节点2：V+（UA741 脚3 收到 Vref）
  node2_vplus: {
    title: '② 節點 2 — μA741 腳3 V⁺',
    explanation: '將 ZD 陰極接到運放腳3（V⁺）並供給 ±Vcc，確認 V⁺ = V_Z ≈ 6.2V。',
    expectedValue: { voltage: '≈ 6.2', unit: 'V' },
    electronFlow: ['V_Z', '→', 'UA741 腳3'],
    
    visibleParts: [
      'zener-1',
      'rb-10',
      'supply-14',
      'supply-15',
      'ua741-9',    // UA741 运放
    ],
    
    visibleWires: [
      'user-1',   'user-2',   'user-22',  'user-23',
      'user-41',  'user-42',  'user-43',  'user-44',
      'user-26',  // 10M (ZD 阴极) → 25L (脚3 V+)
      'user-27',  // 23H (脚7 +Vcc) → 23topRed (+Vcc)
      'user-28',  // 27L (脚4 -Vcc) → 30L
      'user-29',  // 30L → 30topBlue (-Vcc)
    ],
    
    highlightParts: [
      'ua741-9',
    ],
    
    highlightWires: [
      'user-26',
    ],
    
    meterTarget: { nodeId: 'vp' },
  },

  // ③ 节点3：V−（反馈路径回到脚2）
  node3_vminus: {
    title: '③ 節點 3 — μA741 腳2 V⁻',
    explanation: '接上 10kΩ 回授電阻到腳2，負回授穩定後虛短路成立：V⁻ ≈ V⁺ ≈ 6.2V。',
    expectedValue: { voltage: '≈ 6.2', unit: 'V' },
    electronFlow: ['V_L 輸出', '→', '10kΩ', '→', 'UA741 腳2'],
    
    visibleParts: [
      'zener-1',
      'rb-10',      // 1k 限流電阻仍需保留，Vref 基準才成立
      'supply-14',
      'supply-15',
      'ua741-9',
      'r2-13',      // 10k 反馈电阻
    ],
    
    visibleWires: [
      'user-1',   'user-2',   'user-22',  'user-23',
      'user-41',  'user-42',  'user-43',  'user-44',
      'user-26',  'user-27',  'user-28',  'user-29',
      'user-37',  // 40bottomBlue (V_L 输出) → 40P (10k 上端)
      'user-38',  // 23L (脚2 V−) → 24N
      'user-39',  // 24N → 32N (10k 下端)
      'user-40',  // 32bottomBlue → 32R (10k 下端接 GND)
    ],
    
    highlightParts: [
      'r2-13',
    ],
    
    highlightWires: [
      'user-37',  'user-38',  'user-39',  'user-40',
    ],
    
    meterTarget: { nodeId: 'vm' },
  },

  // ④ 节点4：OUT 驱动 NPN Base，同时 C/E 极形成主电流路径
  node4_out: {
    title: '④ 節點 4 — UA741 OUT 驅動 NPN Base',
    explanation: '接上 BJT，UA741 腳6 輸出驅動 NPN Base；同時 C 極接回 +Vcc，E 極接往輸出端 VL，讓 BJT 具備完整 C-E 主電流路徑。',
    expectedValue: { voltage: '≈ 6.8', unit: 'V' },
    electronFlow: ['+Vcc', '→', 'NPN C', '→', 'NPN E / VL', '；UA741 OUT', '→', 'NPN B'],
    
    visibleParts: [
      'zener-1',
      'rb-10',
      'supply-14',
      'supply-15',
      'ua741-9',
      'r2-13',
      'rb-17',
      'npn-11',     // 2SC1384 NPN 三极管
    ],
    
    visibleWires: [
      'user-1',   'user-2',   'user-22',  'user-23',
      'user-41',  'user-42',  'user-43',  'user-44',
      'user-26',  'user-27',  'user-28',  'user-29',
      'user-37',  'user-38',  'user-39',  'user-40',
      'user-31',  // UA741 OUT → NPN Base
      'user-32',  // NPN C → collector supply path start
      'user-33',  // collector supply path continuation
      'user-34',  // collector path → topRed (+Vcc)
      'user-35',  // NPN E → output / VL path
    ],
    
    highlightParts: [
      'npn-11',
    ],
    
    highlightWires: [
      'user-31',  'user-32',  'user-33',  'user-34',  'user-35',
    ],
    
    meterTarget: { nodeId: 'out741' },
  },

  // ⑤ 节点5：V_L（射极输出，主角）
  node5_bjt: {
    title: '⑤ 節點 5 — 射極 V_L（主角）',
    explanation: 'BJT 集極接 +Vcc，射極輸出就是 V_L。換不同 R_L 驗證定電壓效果。',
    expectedValue: { voltage: '≈ 6.2', unit: 'V' },
    electronFlow: ['+Vcc', '→', '集極', '→', '射極 V_L', '→', 'GND'],
    
    visibleParts: [
      'zener-1',
      'rb-10',
      'supply-14',
      'supply-15',
      'ua741-9',
      'r2-13',
      'rb-17',
      'npn-11',
    ],
    
    visibleWires: [
      'user-1',   'user-2',   'user-22',  'user-23',
      'user-41',  'user-42',  'user-43',  'user-44',
      'user-26',  'user-27',  'user-28',  'user-29',
      'user-37',  'user-38',  'user-39',  'user-40',
      'user-31',  'user-32',
      'user-33',  // 43J (BJT 射极) → 49J
      'user-34',  // 49J → 49topRed (连到 +Vcc)
      'user-35',  // 40G (BJT 集极) → 40K
    ],
    
    highlightParts: [
      'npn-11',
    ],
    
    highlightWires: [
      'user-33',  'user-34',  'user-35',
    ],
    
    meterTarget: { nodeId: 'vl' },
  },

  // ⑥ 节点6：完整闭环验证 + 电表
  node6_feedback: {
    title: '⑥ 節點 6 — 集極 + 完整負回授驗證',
    explanation: '全部接好，接上三用電表量 V_L。確認 ΔV_L < 100mV 即驗證定電壓成立。',
    expectedValue: { voltage: '≈ 6.2', unit: 'V' },
    electronFlow: ['完整閉迴路', '→', 'V_L ≈ V_Z'],
    
    visibleParts: [
      'zener-1',
      'rb-10',
      'supply-14',
      'supply-15',
      'ua741-9',
      'r2-13',
      'rb-17',
      'npn-11',
      'meter-16',   // 数字万用表
    ],
    
    visibleWires: [
      'user-1',   'user-2',   'user-22',  'user-23',
      'user-41',  'user-42',  'user-43',  'user-44',
      'user-26',  'user-27',  'user-28',  'user-29',
      'user-37',  'user-38',  'user-39',  'user-40',
      'user-31',  'user-32',
      'user-33',  'user-34',  'user-35',
      'user-48',  // 40L → meter-16 (+端)
      'user-49',  // 62bottomBlue → meter-16 (-端)
    ],
    
    highlightParts: [
      'meter-16',
    ],
    
    highlightWires: [
      'user-48',  'user-49',
    ],
    
    meterTarget: { nodeId: 'vl' },
  },
}
