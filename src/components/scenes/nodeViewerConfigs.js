/**
 * 节点查看器配置
 * 定义每个教学节点要显示、高亮的元件和线路
 */

export const SCENE_CONFIGS = {
  // 第04页：节点1 - Vref 齐纳恒压
  node1_vref: {
    title: 'Vref：電壓參考',
    description: 'Zener二极管产生稳定的参考电压 6.2V',
    
    // 显示这些parts（其他parts隐藏）
    visibleParts: [
      'zener-1',
      'rb-10',
      'supply-14',
      'supply-15',
    ],
    
    // 显示这些wires（其他wires隐藏）
    visibleWires: [
      'user-1',   // +Vcc to 1topRed
      'user-2',   // GND to 1bottomBlue
      'user-22',  // 10topRed → 10H (1k 上端)
      'user-23',  // 10T → 10bottomBlue (1k 下端 → GND)
      'user-41',  // 连接到 supply-14
      'user-42',  // 连接到 supply-15
      'user-3',   // supply-15 连接
      'user-4',   // supply-15 连接
    ],
    
    // 这些parts/wires用高亮色
    highlightParts: [
      'zener-1',
      'rb-10',
    ],
    
    highlightWires: [
      'user-22',
      'user-23',
    ],
    
    // DMM 指向这个part的某个pin
    meterTarget: {
      partId: 'zener-1',
      nodeId: 'vref',  // 对应 circuitModel.vref
      position: { x: 110, y: 175 },  // 根据电路图的node1位置
    },
    
    // 预期测量值
    expectedValue: {
      voltage: 6.2,
      unit: 'V',
      description: 'Zener Reference Voltage',
    },
    
    // 说明文本
    explanation: '1kΩ 电阻将电源电流限制到齐纳二极管。齐纳二极管保持阴极处的电压恒定在 6.2V，这就是我们的参考电压 Vref。',
    
    // 电子流淌路径提示
    electronFlow: ['+Vcc → 1kΩ → Zener → GND'],
  },

  // 第05页：节点2 - V+ 运放同相输入
  node2_vplus: {
    title: 'V+：UA741 同相輸入',
    description: '参考电压连接到运放的同相输入端（脚3）',
    
    visibleParts: [
      'zener-1',
      'rb-10',
      'ua741-9',
      'supply-14',
      'supply-15',
    ],
    
    visibleWires: [
      'user-1',
      'user-2',
      'user-22',
      'user-23',
      'user-26',  // 10M → 25L (zener → 运放脚3)
      'user-27',  // 23H → 23topRed
      'user-41',
      'user-42',
      'user-3',
      'user-4',
    ],
    
    highlightParts: [
      'ua741-9',
    ],
    
    highlightWires: [
      'user-26',
      'user-27',
    ],
    
    meterTarget: {
      partId: 'ua741-9',
      nodeId: 'vplus',  // 对应 circuitModel.vplus
      pinName: 'connector2',  // 脚3
      position: { x: 200, y: 215 },
    },
    
    expectedValue: {
      voltage: 6.2,
      unit: 'V',
      description: 'Non-inverting input of Op-Amp',
    },
    
    explanation: '齐纳的输出（Vref）直接连接到 UA741 运放的脚3（同相输入）。这是我们的参考电压输入，运放会将其与反馈电压进行比较。',
    
    electronFlow: ['Vref → UA741 脚3'],
  },

  // 第06页：节点3 - V− 运放反相输入
  node3_vminus: {
    title: 'V−：UA741 反相輸入',
    description: '反馈电压连接到运放的反相输入端（脚2），形成虚短路',
    
    visibleParts: [
      'zener-1',
      'rb-10',
      'ua741-9',
      'npn-11',
      'r2-13',
      'supply-14',
      'supply-15',
    ],
    
    visibleWires: [
      'user-1',
      'user-2',
      'user-22',
      'user-23',
      'user-26',
      'user-27',
      'user-38',  // 23L → 24N (反馈网络)
      'user-39',  // 24N → 32N
      'user-40',  // 32bottomBlue → 32R
      'user-41',
      'user-42',
      'user-3',
      'user-4',
    ],
    
    highlightParts: [
      'ua741-9',
      'r2-13',
    ],
    
    highlightWires: [
      'user-38',
      'user-39',
      'user-40',
    ],
    
    meterTarget: {
      partId: 'ua741-9',
      nodeId: 'vminus',  // 对应 circuitModel.vminus
      pinName: 'connector1',  // 脚2
      position: { x: 200, y: 260 },
    },
    
    expectedValue: {
      voltage: 6.2,
      unit: 'V',
      description: 'Inverting input of Op-Amp (virtual short)',
    },
    
    explanation: '负反馈网络从输出取样，将反馈电压送入运放脚2。运放的虚短路原理使脚2 ≈ 脚3，因此 V− ≈ 6.2V。',
    
    electronFlow: ['输出 → 反馈网络 → UA741 脚2'],
  },

  // 第07页：节点4 - OUT 运放输出
  node4_out: {
    title: 'UA741 OUT：修正訊號',
    description: '运放比较脚3和脚2的电压，输出修正信号驱动BJT',
    
    visibleParts: [
      'zener-1',
      'rb-10',
      'ua741-9',
      'npn-11',
      'supply-14',
      'supply-15',
    ],
    
    visibleWires: [
      'user-1',
      'user-2',
      'user-22',
      'user-23',
      'user-26',
      'user-27',
      'user-31',  // 25H → 44G (脚6 → BJT基极)
      'user-38',
      'user-39',
      'user-40',
      'user-41',
      'user-42',
      'user-3',
      'user-4',
    ],
    
    highlightParts: [
      'ua741-9',
    ],
    
    highlightWires: [
      'user-31',
    ],
    
    meterTarget: {
      partId: 'ua741-9',
      nodeId: 'opAmpOut',  // 对应 circuitModel.opAmpOut
      pinName: 'connector5',  // 脚6 OUT
      position: { x: 355, y: 238 },
    },
    
    expectedValue: {
      voltage: 6.8,
      unit: 'V',
      description: 'Op-Amp output (drives BJT base)',
    },
    
    explanation: '当脚2的反馈电压低于脚3的参考电压时，运放输出上升到约 6.8V（6.2V Vref + 0.6V Vbe），以驱动BJT基极导通。',
    
    electronFlow: ['脚3/脚2 比较 → 脚6 输出修正信号'],
  },

  // 第08页：节点5/6 - BJT驱动与功率级
  node5_bjt: {
    title: 'NPN Base：控制端與輸出調整',
    description: 'BJT 基极接收修正信号，集极驱动负载，射极输出稳压电压',
    
    visibleParts: [
      'zener-1',
      'rb-10',
      'ua741-9',
      'npn-11',
      'r2-13',
      'supply-14',
      'supply-15',
    ],
    
    visibleWires: [
      'user-22',
      'user-23',
      'user-26',
      'user-27',
      'user-31',  // 脚6 → 基极
      'user-32',  // 42G → 43I (BJT基极输入)
      'user-33',  // 43J → 49J (集极到输出)
      'user-34',  // 49J → 49topRed (集极到Vcc)
      'user-35',  // 40G → 40K (射极输出)
      'user-37',  // 40bottomBlue → 40P (射极接反馈网络)
      'user-38',
      'user-39',
      'user-40',
      'user-41',
      'user-42',
      'user-1',
      'user-2',
      'user-3',
      'user-4',
    ],
    
    highlightParts: [
      'npn-11',
    ],
    
    highlightWires: [
      'user-31',
      'user-32',
      'user-33',
      'user-34',
      'user-35',
      'user-37',
    ],
    
    meterTarget: {
      partId: 'npn-11',
      nodeId: 'vout',  // 对应 circuitModel.vout
      position: { x: 421, y: 238 },
    },
    
    expectedValue: {
      voltage: 6.2,
      unit: 'V',
      description: 'BJT emitter output (load voltage)',
    },
    
    explanation: '运放的修正信号驱动BJT基极。BJT 集极连接到 +Vcc，射极输出经过反馈网络回到运放脚2，形成稳压输出。',
    
    electronFlow: ['脚6 → BJT基极 → 射极输出 → 反馈'],
  },

  // 第09页：完整回授
  node6_feedback: {
    title: 'VL：輸出電壓量測 + 完整負回授',
    description: '完整的闭环反馈电路，形成稳压调节器',
    
    visibleParts: [
      'zener-1',
      'rb-10',
      'ua741-9',
      'npn-11',
      'r2-13',
      'supply-14',
      'supply-15',
      'meter-16',
    ],
    
    visibleWires: [
      'user-1',
      'user-2',
      'user-3',
      'user-4',
      'user-22',
      'user-23',
      'user-26',
      'user-27',
      'user-28',
      'user-29',
      'user-31',
      'user-32',
      'user-33',
      'user-34',
      'user-35',
      'user-37',
      'user-38',
      'user-39',
      'user-40',
      'user-41',
      'user-42',
      'user-43',
      'user-44',
    ],
    
    highlightParts: [
      'npn-11',
      'r2-13',
    ],
    
    highlightWires: [
      'user-35',
      'user-37',
      'user-38',
      'user-39',
      'user-40',
    ],
    
    meterTarget: {
      partId: 'meter-16',
      nodeId: 'vout',  // 对应 circuitModel.vout
      position: { x: 620, y: 306 },
    },
    
    expectedValue: {
      voltage: 6.2,
      unit: 'V',
      description: 'Final regulated output voltage',
    },
    
    explanation: '完整的负反馈回路：Vref 与反馈电压比较 → 运放输出修正 → BJT调节输出 → 反馈采样 → 形成稳压调节器。',
    
    electronFlow: ['完整闭环：Vref ← → Feedback ← → Output'],
  },
}
