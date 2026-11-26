// gen_denwa_koji_workflow.js — 電話工事依頼書 Workflow Testcase
// Creator: ThuNT | Date: 2026-08-14 | Template: testcase_template_workflow.xlsx
"use strict";
const path = require("path");
const ExcelJS = require("exceljs");

const TEMPLATE = path.resolve(__dirname, "..", "..", "..", "templates", "testcase", "testcase_template_workflow.xlsx");
const OUTPUT   = path.resolve(__dirname, "..", "..", "..", "CMS", "Testcase", "\u3010\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8\u3011\u30ef\u30fc\u30af\u30d5\u30ed\u30fc.xlsx");
const SHEET    = "\u30ef\u30fc\u30af\u30d5\u30ed\u30fc";
const CREATOR  = "ThuNT";
const TODAY    = new Date("2026-08-14");

// TC data: [no, daiko, chuko(always ""), shoko, condition, user(always ""), input, output]
// \n = actual newline in cell (wrapText auto-enabled)
const TC = [
  // ===== 電話工事依頼書_Full Node =====

  // --- 申請者 actions (TC 1-5) ---
  [1,  "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Full Node", "", "\u4e00\u6642\u4fdd\u5b58",
   "\u7533\u8acb\u8005 thao t\u00e1c t\u1ea1o b\u1ea3n ghi", "",
   "Nh\u1eadp th\u00f4ng tin, b\u1ea5m button \u4e00\u6642\u4fdd\u5b58",
   "- Status = \u4e00\u6642\u4fdd\u5b58\n- B\u1ea3n ghi \u0111\u01b0\u1ee3c l\u01b0u nh\u00e1p\n- Kh\u00f4ng g\u1eedi mail"],
  [2,  "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Full Node", "", "\u7533\u8acb",
   "B\u1ea3n ghi \u1edf tr\u1ea1ng th\u00e1i \u4e00\u6642\u4fdd\u5b58\nFull Node: ch\u1ec9 \u0111\u1ecbnh \u4e0a\u9577/\u90e8\u9580\u9577", "",
   "User \u7533\u8acb\u8005 ch\u1ec9 \u0111\u1ecbnh \u4e0a\u9577/\u90e8\u9580\u9577, b\u1ea5m button \u7533\u8acb",
   "- Status = \u4e0a\u9577\u5f85\u3061\n- G\u1eedi mail shounin \u0111\u1ebfn user \u4e0a\u9577"],
  [3,  "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Full Node", "", "\u518d\u7533\u8acb",
   "Status = \u7533\u8acb\u8005\u5f85\u3061\n(sau \u5dee\u623b\u3057 ho\u1eb7c \u5f15\u304d\u623b\u3057)", "",
   "User \u7533\u8acb\u8005 b\u1ea5m button \u518d\u7533\u8acb",
   "- Status = \u4e0a\u9577\u5f85\u3061\n- G\u1eedi mail shounin \u0111\u1ebfn user \u4e0a\u9577"],
  [4,  "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Full Node", "", "\u5f15\u304d\u623b\u3057",
   "\u7533\u8acb\u8005 \u0111\u00e3 \u7533\u8acb\nStatus hi\u1ec7n = \u4e0a\u9577\u5f85\u3061", "",
   "User \u7533\u8acb\u8005 b\u1ea5m \u5f15\u304d\u623b\u3057",
   "- Status = \u7533\u8acb\u8005\u5f85\u3061\n- X\u00f3a d\u1ea5u \u7533\u8acb\u8005"],
  [5,  "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Full Node", "", "\u53d6\u6b62\u3081",
   "B\u1ea3n ghi \u1edf status \u4e00\u6642\u4fdd\u5b58 ho\u1eb7c \u7533\u8acb\u8005\u5f85\u3061", "",
   "User \u7533\u8acb\u8005 b\u1ea5m \u53d6\u6b62\u3081",
   "Status = \u53d6\u6b62\u3081\u3001done x\u1eed l\u00fd"],

  // --- 上長 actions (TC 10-12) ---
  [10, "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Full Node", "", "\u627f\u8a8d",
   "T\u1ea1i node \u4e0a\u9577", "",
   "User \u4e0a\u9577 shounin",
   "- Status = \u90e8\u9580\u9577\u5f85\u3061\n- G\u1eedi mail shounin \u0111\u1ebfn user \u90e8\u9580\u9577"],
  [11, "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Full Node", "", "\u5dee\u623b\u3057",
   "T\u1ea1i node \u4e0a\u9577", "",
   "User \u4e0a\u9577 b\u1ea5m \u5dee\u623b\u3057\u3078\u7533\u8acb\u8005",
   "- G\u1eedi mail \u5dee\u623b\u3057 \u0111\u1ebfn user \u7533\u8acb\u8005\n- Status = \u7533\u8acb\u8005\u5f85\u3061\n- X\u00f3a d\u1ea5u c\u00e1c user \u0111\u00e3 \u0111\u00f3ng d\u1ea5u"],
  [12, "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Full Node", "", "\u5f15\u304d\u623b\u3057",
   "\u4e0a\u9577 \u0111\u00e3 shounin\nStatus = \u90e8\u9580\u9577\u5f85\u3061\n(tr\u01b0\u1edbc khi \u90e8\u9580\u9577 approve)", "",
   "User \u4e0a\u9577 b\u1ea5m \u5f15\u304d\u623b\u3057",
   "- Status = \u4e0a\u9577\u5f85\u3061\n- X\u00f3a d\u1ea5u \u4e0a\u9577"],

  // --- 部門長 actions (TC 13-15) ---
  [13, "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Full Node", "", "\u627f\u8a8d",
   "T\u1ea1i node \u90e8\u9580\u9577", "",
   "User \u90e8\u9580\u9577 shounin",
   "- Status = \u53d7\u4ed8\u5f85\u3061\n- G\u1eedi mail shounin \u0111\u1ebfn user \u53d7\u4ed8"],
  [14, "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Full Node", "", "\u5dee\u623b\u3057",
   "T\u1ea1i node \u90e8\u9580\u9577", "",
   "User \u90e8\u9580\u9577 b\u1ea5m \u5dee\u623b\u3057\u3078\u7533\u8acb\u8005",
   "- G\u1eedi mail \u5dee\u623b\u3057 \u0111\u1ebfn user \u7533\u8acb\u8005\n- Status = \u7533\u8acb\u8005\u5f85\u3061\n- X\u00f3a d\u1ea5u c\u00e1c user \u0111\u00e3 \u0111\u00f3ng d\u1ea5u"],
  [15, "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Full Node", "", "\u5f15\u304d\u623b\u3057",
   "\u90e8\u9580\u9577 \u0111\u00e3 shounin\nStatus = \u53d7\u4ed8\u5f85\u3061\n(tr\u01b0\u1edbc khi \u53d7\u4ed8 approve)", "",
   "User \u90e8\u9580\u9577 b\u1ea5m \u5f15\u304d\u623b\u3057",
   "- Status = \u90e8\u9580\u9577\u5f85\u3061\n- X\u00f3a d\u1ea5u \u90e8\u9580\u9577"],

  // --- 受付 actions (TC 16-18) ---
  [16, "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Full Node", "", "\u627f\u8a8d",
   "T\u1ea1i node \u53d7\u4ed8", "",
   "User \u53d7\u4ed8 shounin",
   "- Status = \u627f\u8a8d\u5f85\u3061\n- G\u1eedi mail shounin \u0111\u1ebfn user \u627f\u8a8d"],
  [17, "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Full Node", "", "\u5dee\u623b\u3057",
   "T\u1ea1i node \u53d7\u4ed8", "",
   "User \u53d7\u4ed8 b\u1ea5m \u5dee\u623b\u3057\u3078\u7533\u8acb\u8005",
   "- G\u1eedi mail \u5dee\u623b\u3057 \u0111\u1ebfn user \u7533\u8acb\u8005\n- Status = \u7533\u8acb\u8005\u5f85\u3061\n- X\u00f3a d\u1ea5u c\u00e1c user \u0111\u00e3 \u0111\u00f3ng d\u1ea5u"],
  [18, "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Full Node", "", "\u5f15\u304d\u623b\u3057",
   "\u53d7\u4ed8 \u0111\u00e3 shounin\nStatus = \u627f\u8a8d\u5f85\u3061\n(tr\u01b0\u1edbc khi \u627f\u8a8d approve)", "",
   "User \u53d7\u4ed8 b\u1ea5m \u5f15\u304d\u623b\u3057",
   "- Status = \u53d7\u4ed8\u5f85\u3061\n- X\u00f3a d\u1ea5u \u53d7\u4ed8"],

  // --- 承認 actions (TC 19-21) ---
  [19, "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Full Node", "", "\u627f\u8a8d",
   "T\u1ea1i node \u627f\u8a8d", "",
   "User \u627f\u8a8d shounin",
   "- Status = \u5b8c\u4e86\n- G\u1eedi mail Done \u0111\u1ebfn all user tr\u00ean node"],
  [20, "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Full Node", "", "\u5dee\u623b\u3057",
   "T\u1ea1i node \u627f\u8a8d", "",
   "User \u627f\u8a8d b\u1ea5m \u5dee\u623b\u3057\u3078\u7533\u8acb\u8005",
   "- G\u1eedi mail \u5dee\u623b\u3057 \u0111\u1ebfn user \u7533\u8acb\u8005\n- Status = \u7533\u8acb\u8005\u5f85\u3061\n- X\u00f3a d\u1ea5u c\u00e1c user \u0111\u00e3 \u0111\u00f3ng d\u1ea5u"],
  [21, "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Full Node", "", "\u5f15\u304d\u623b\u3057",
   "\u627f\u8a8d \u0111\u00e3 shounin\nStatus = \u5b8c\u4e86\n(\u5b8c\u4e86 ch\u01b0a b\u1ecb final\u00f3a)", "",
   "User \u627f\u8a8d b\u1ea5m \u5f15\u304d\u623b\u3057",
   "- Status = \u627f\u8a8d\u5f85\u3061\n- X\u00f3a d\u1ea5u \u627f\u8a8d"],

  // --- 連絡先: từng node bấm button (TC 30-33) ---
  [30, "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Full Node", "", "\u9023\u7d61\u5148",
   "T\u1ea1i node \u4e0a\u9577\nStatus = \u4e0a\u9577\u5f85\u3061", "",
   "User \u4e0a\u9577 b\u1ea5m button \u9023\u7d61\u5148",
   "- G\u1eedi mail \u9023\u7d61 \u0111\u1ebfn user \u7533\u8acb\u8005"],
  [31, "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Full Node", "", "\u9023\u7d61\u5148",
   "T\u1ea1i node \u90e8\u9580\u9577\nStatus = \u90e8\u9580\u9577\u5f85\u3061", "",
   "User \u90e8\u9580\u9577 b\u1ea5m button \u9023\u7d61\u5148",
   "- G\u1eedi mail \u9023\u7d61 \u0111\u1ebfn user \u7533\u8acb\u8005"],
  [32, "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Full Node", "", "\u9023\u7d61\u5148",
   "T\u1ea1i node \u53d7\u4ed8\nStatus = \u53d7\u4ed8\u5f85\u3061", "",
   "User \u53d7\u4ed8 b\u1ea5m button \u9023\u7d61\u5148",
   "- G\u1eedi mail \u9023\u7d61 \u0111\u1ebfn user \u7533\u8acb\u8005"],
  [33, "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Full Node", "", "\u9023\u7d61\u5148",
   "T\u1ea1i node \u627f\u8a8d\nStatus = \u627f\u8a8d\u5f85\u3061", "",
   "User \u627f\u8a8d b\u1ea5m button \u9023\u7d61\u5148",
   "- G\u1eedi mail \u9023\u7d61 \u0111\u1ebfn user \u7533\u8acb\u8005"],

  // ===== 電話工事依頼書_Not Full Node =====
  [40, "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Not Full Node", "", "Node_name",
   "Not Full Node\n\u30ea\u30b9\u30c8ALL\u304b\u3089\u627f\u8a8d\u64cd\u4f5c\nSkip \u4e0a\u9577", "",
   "User \u7533\u8acb\u8005 t\u1ea1o Doc, ch\u1ec9 ch\u1ec9 \u0111\u1ecbnh \u90e8\u9580\u9577 (kh\u00f4ng add \u4e0a\u9577), b\u1ea5m button \u7533\u8acb",
   "- Status = \u90e8\u9580\u9577\u5f85\u3061\n- G\u1eedi mail shounin \u0111\u1ebfn user \u90e8\u9580\u9577"],
  [41, "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Not Full Node", "", "Node_name", "", "",
   "User \u90e8\u9580\u9577 shounin",
   "- Status = \u53d7\u4ed8\u5f85\u3061\n- G\u1eedi mail shounin \u0111\u1ebfn user \u53d7\u4ed8"],
  [42, "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Not Full Node", "", "Node_name", "", "",
   "User \u53d7\u4ed8 shounin",
   "- Status = \u627f\u8a8d\u5f85\u3061\n- G\u1eedi mail shounin \u0111\u1ebfn user \u627f\u8a8d"],
  [43, "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Not Full Node", "", "Node_name", "", "",
   "User \u627f\u8a8d shounin",
   "- Status = \u5b8c\u4e86\u5f85\u3061\n- G\u1eedi mail shounin \u0111\u1ebfn user \u5b8c\u4e86"],
  [44, "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Not Full Node", "", "Node_name", "", "",
   "User \u5b8c\u4e86 shounin",
   "- Status = \u5b8c\u4e86\n- G\u1eedi mail done \u0111\u1ebfn all user tr\u00ean node"],
  [47, "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Not Full Node", "", "\u5dee\u623b",
   "User shouninsha th\u1ef1c hi\u1ec7n \u5dee\u623b\u3057 (Node2~6)", "",
   "B\u1ea5m button \u5dee\u623b\u3057\u3078\u7533\u8acb\u8005",
   "- G\u1eedi mail \u5dee\u623b\u3057 \u0111\u1ebfn user \u7533\u8acb\u8005\n- Status = \u7533\u8acb\u8005\u5f85\u3061\n- Th\u1ef1c hi\u1ec7n x\u00f3a d\u1ea5u c\u00e1c user \u0111\u00e3 \u0111\u00f3ng d\u1ea5u"],
  [48, "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Not Full Node", "", "\u5f15\u304d\u623b\u3057",
   "Random user k\u00e9o v\u1ec1", "",
   "Sau khi shounin, b\u1ea5m \u5f15\u304d\u623b\u3057",
   "Back v\u1ec1 status tr\u01b0\u1edbc \u0111\u00f3, x\u00f3a d\u1ea5u, c\u00f3 th\u1ec3 shounin/ sashi"],
  [49, "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8_Not Full Node", "", "\u53d6\u6b62\u3081",
   "b\u1ea3n ghi \u1edf status save nh\u00e1p or saishinsei", "",
   "B\u1ea5m \u53d6\u6b62\u3081",
   "Status = \u53d6\u6b62\u3081\u3001done x\u1eed l\u00fd"],
];

// Scenario data: [no, daiko, chuko, shoko, cond, user, input, output]
// 3 luồng happy-path Full Node (không có 引き戻し/差戻し/取止め/連絡先)
const SCENARIO = [
  // ===== Scenario 1: 一時保存 → 申請 → 承認 → Done (6 steps) =====
  [1, "\u30b7\u30ca\u30ea\u30aa1\uff1a\u4e00\u6642\u4fdd\u5b58\u2192\u7533\u8acb\u2192\u627f\u8a8d\u2192Done",
   "Step 1", "\u4e00\u6642\u4fdd\u5b58",
   "\u7533\u8acb\u8005 thao t\u00e1c t\u1ea1o b\u1ea3n ghi", "\u7533\u8acb\u8005",
   "Nh\u1eadp th\u00f4ng tin \u2192 b\u1ea5m \u4e00\u6642\u4fdd\u5b58",
   "- Status = \u4e00\u6642\u4fdd\u5b58\n- B\u1ea3n ghi \u0111\u01b0\u1ee3c l\u01b0u nh\u00e1p\n- Kh\u00f4ng g\u1eedi mail"],
  [1, "\u30b7\u30ca\u30ea\u30aa1\uff1a\u4e00\u6642\u4fdd\u5b58\u2192\u7533\u8acb\u2192\u627f\u8a8d\u2192Done",
   "Step 2", "\u7533\u8acb",
   "Status = \u4e00\u6642\u4fdd\u5b58", "\u7533\u8acb\u8005",
   "Ch\u1ec9 \u0111\u1ecbnh \u4e0a\u9577/\u90e8\u9580\u9577 \u2192 b\u1ea5m \u7533\u8acb",
   "- Status = \u4e0a\u9577\u5f85\u3061\n- G\u1eedi mail shounin \u0111\u1ebfn \u4e0a\u9577"],
  [1, "\u30b7\u30ca\u30ea\u30aa1\uff1a\u4e00\u6642\u4fdd\u5b58\u2192\u7533\u8acb\u2192\u627f\u8a8d\u2192Done",
   "Step 3", "\u627f\u8a8d(\u4e0a\u9577)",
   "Status = \u4e0a\u9577\u5f85\u3061", "\u4e0a\u9577",
   "B\u1ea5m shounin",
   "- Status = \u90e8\u9580\u9577\u5f85\u3061\n- G\u1eedi mail shounin \u0111\u1ebfn \u90e8\u9580\u9577"],
  [1, "\u30b7\u30ca\u30ea\u30aa1\uff1a\u4e00\u6642\u4fdd\u5b58\u2192\u7533\u8acb\u2192\u627f\u8a8d\u2192Done",
   "Step 4", "\u627f\u8a8d(\u90e8\u9580\u9577)",
   "Status = \u90e8\u9580\u9577\u5f85\u3061", "\u90e8\u9580\u9577",
   "B\u1ea5m shounin",
   "- Status = \u53d7\u4ed8\u5f85\u3061\n- G\u1eedi mail shounin \u0111\u1ebfn \u53d7\u4ed8"],
  [1, "\u30b7\u30ca\u30ea\u30aa1\uff1a\u4e00\u6642\u4fdd\u5b58\u2192\u7533\u8acb\u2192\u627f\u8a8d\u2192Done",
   "Step 5", "\u627f\u8a8d(\u53d7\u4ed8)",
   "Status = \u53d7\u4ed8\u5f85\u3061", "\u53d7\u4ed8",
   "B\u1ea5m shounin",
   "- Status = \u627f\u8a8d\u5f85\u3061\n- G\u1eedi mail shounin \u0111\u1ebfn \u627f\u8a8d"],
  [1, "\u30b7\u30ca\u30ea\u30aa1\uff1a\u4e00\u6642\u4fdd\u5b58\u2192\u7533\u8acb\u2192\u627f\u8a8d\u2192Done",
   "Step 6", "\u627f\u8a8d(\u627f\u8a8d)",
   "Status = \u627f\u8a8d\u5f85\u3061", "\u627f\u8a8d",
   "B\u1ea5m shounin",
   "- Status = \u5b8c\u4e86\n- G\u1eedi mail Done \u0111\u1ebfn all user tr\u00ean node"],

  // ===== Scenario 2: 申請 → 承認 → Done (5 steps) =====
  [2, "\u30b7\u30ca\u30ea\u30aa2\uff1a\u7533\u8acb\u2192\u627f\u8a8d\u2192Done",
   "Step 1", "\u7533\u8acb",
   "\u7533\u8acb\u8005 t\u1ea1o b\u1ea3n ghi m\u1edbi\n(kh\u00f4ng qua \u4e00\u6642\u4fdd\u5b58)", "\u7533\u8acb\u8005",
   "Nh\u1eadp th\u00f4ng tin \u2192 ch\u1ec9 \u0111\u1ecbnh \u4e0a\u9577/\u90e8\u9580\u9577 \u2192 b\u1ea5m \u7533\u8acb",
   "- Status = \u4e0a\u9577\u5f85\u3061\n- G\u1eedi mail shounin \u0111\u1ebfn \u4e0a\u9577"],
  [2, "\u30b7\u30ca\u30ea\u30aa2\uff1a\u7533\u8acb\u2192\u627f\u8a8d\u2192Done",
   "Step 2", "\u627f\u8a8d(\u4e0a\u9577)",
   "Status = \u4e0a\u9577\u5f85\u3061", "\u4e0a\u9577",
   "B\u1ea5m shounin",
   "- Status = \u90e8\u9580\u9577\u5f85\u3061\n- G\u1eedi mail shounin \u0111\u1ebfn \u90e8\u9580\u9577"],
  [2, "\u30b7\u30ca\u30ea\u30aa2\uff1a\u7533\u8acb\u2192\u627f\u8a8d\u2192Done",
   "Step 3", "\u627f\u8a8d(\u90e8\u9580\u9577)",
   "Status = \u90e8\u9580\u9577\u5f85\u3061", "\u90e8\u9580\u9577",
   "B\u1ea5m shounin",
   "- Status = \u53d7\u4ed8\u5f85\u3061\n- G\u1eedi mail shounin \u0111\u1ebfn \u53d7\u4ed8"],
  [2, "\u30b7\u30ca\u30ea\u30aa2\uff1a\u7533\u8acb\u2192\u627f\u8a8d\u2192Done",
   "Step 4", "\u627f\u8a8d(\u53d7\u4ed8)",
   "Status = \u53d7\u4ed8\u5f85\u3061", "\u53d7\u4ed8",
   "B\u1ea5m shounin",
   "- Status = \u627f\u8a8d\u5f85\u3061\n- G\u1eedi mail shounin \u0111\u1ebfn \u627f\u8a8d"],
  [2, "\u30b7\u30ca\u30ea\u30aa2\uff1a\u7533\u8acb\u2192\u627f\u8a8d\u2192Done",
   "Step 5", "\u627f\u8a8d(\u627f\u8a8d)",
   "Status = \u627f\u8a8d\u5f85\u3061", "\u627f\u8a8d",
   "B\u1ea5m shounin",
   "- Status = \u5b8c\u4e86\n- G\u1eedi mail Done \u0111\u1ebfn all user tr\u00ean node"],

  // ===== Scenario 3: 再申請 → 承認 → Done (5 steps) =====
  [3, "\u30b7\u30ca\u30ea\u30aa3\uff1a\u518d\u7533\u8acb\u2192\u627f\u8a8d\u2192Done",
   "Step 1", "\u518d\u7533\u8acb",
   "\u7533\u8acb\u8005 \u0111\u00e3 \u7533\u8acb\n\u5dee\u623b\u3057 t\u1eeb node b\u1ea5t k\u1ef3\nStatus = \u7533\u8acb\u8005\u5f85\u3061", "\u7533\u8acb\u8005",
   "B\u1ea5m \u518d\u7533\u8acb",
   "- Status = \u4e0a\u9577\u5f85\u3061\n- G\u1eedi mail shounin \u0111\u1ebfn \u4e0a\u9577"],
  [3, "\u30b7\u30ca\u30ea\u30aa3\uff1a\u518d\u7533\u8acb\u2192\u627f\u8a8d\u2192Done",
   "Step 2", "\u627f\u8a8d(\u4e0a\u9577)",
   "Status = \u4e0a\u9577\u5f85\u3061", "\u4e0a\u9577",
   "B\u1ea5m shounin",
   "- Status = \u90e8\u9580\u9577\u5f85\u3061\n- G\u1eedi mail shounin \u0111\u1ebfn \u90e8\u9580\u9577"],
  [3, "\u30b7\u30ca\u30ea\u30aa3\uff1a\u518d\u7533\u8acb\u2192\u627f\u8a8d\u2192Done",
   "Step 3", "\u627f\u8a8d(\u90e8\u9580\u9577)",
   "Status = \u90e8\u9580\u9577\u5f85\u3061", "\u90e8\u9580\u9577",
   "B\u1ea5m shounin",
   "- Status = \u53d7\u4ed8\u5f85\u3061\n- G\u1eedi mail shounin \u0111\u1ebfn \u53d7\u4ed8"],
  [3, "\u30b7\u30ca\u30ea\u30aa3\uff1a\u518d\u7533\u8acb\u2192\u627f\u8a8d\u2192Done",
   "Step 4", "\u627f\u8a8d(\u53d7\u4ed8)",
   "Status = \u53d7\u4ed8\u5f85\u3061", "\u53d7\u4ed8",
   "B\u1ea5m shounin",
   "- Status = \u627f\u8a8d\u5f85\u3061\n- G\u1eedi mail shounin \u0111\u1ebfn \u627f\u8a8d"],
  [3, "\u30b7\u30ca\u30ea\u30aa3\uff1a\u518d\u7533\u8acb\u2192\u627f\u8a8d\u2192Done",
   "Step 5", "\u627f\u8a8d(\u627f\u8a8d)",
   "Status = \u627f\u8a8d\u5f85\u3061", "\u627f\u8a8d",
   "B\u1ea5m shounin",
   "- Status = \u5b8c\u4e86\n- G\u1eedi mail Done \u0111\u1ebfn all user tr\u00ean node"],
];

async function run() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(TEMPLATE);
  const ws = wb.getWorksheet(SHEET);

  ws.getCell("F2").value = "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8";
  ws.getCell("F3").value = CREATOR;
  ws.getCell("F4").value = TODAY;

  const anchorRow = ws.getRow(11);
  const anchorStyles = {};
  for (let c = 2; c <= 10; c++) {
    const cell = anchorRow.getCell(c);
    anchorStyles[c] = cell.style ? JSON.parse(JSON.stringify(cell.style)) : {};
  }
  const anchorHeight = anchorRow.height || 40;

  if (ws.model && Array.isArray(ws.model.merges)) {
    [...ws.model.merges].forEach(m => {
      const match = m.match(/^[A-Z]+(\d+)/);
      if (match && parseInt(match[1]) >= 11) {
        try { ws.unMergeCells(m); } catch (_) {}
      }
    });
  }

  for (let r = ws.rowCount; r >= 11; r--) {
    ws.spliceRows(r, 1);
  }

  TC.forEach(([no, daiko, chuko, shoko, cond, user, input, output], idx) => {
    const rowNum = 11 + idx;
    const row = ws.getRow(rowNum);
    row.height = anchorHeight;
    const vals = [no, daiko, chuko, shoko, cond, user, input, output, ""];
    vals.forEach((v, i) => {
      const colNum = i + 2;
      const cell = row.getCell(colNum);
      cell.value = (v === "" || v == null) ? null : v;
      if (anchorStyles[colNum]) cell.style = JSON.parse(JSON.stringify(anchorStyles[colNum]));
      if (typeof v === "string" && v.indexOf("\n") !== -1) {
        cell.alignment = Object.assign({}, cell.alignment || {}, { wrapText: true, vertical: "top" });
      }
    });
    row.commit();
  });

  let mergeStart = 11;
  for (let i = 1; i <= TC.length; i++) {
    const diff = i === TC.length || TC[i][1] !== TC[i - 1][1];
    if (diff) {
      const mergeEnd = 10 + i;
      if (mergeEnd > mergeStart) {
        try { ws.mergeCells(mergeStart, 3, mergeEnd, 3); } catch (_) {}
      }
      if (i < TC.length) mergeStart = 11 + i;
    }
  }

  require("fs").mkdirSync(path.dirname(OUTPUT), { recursive: true });

  // ===== Build Scenario sheet =====
  const wsSc = wb.addWorksheet("Scenario");
  // Copy column widths
  for (let c = 1; c <= 11; c++) {
    const srcCol = ws.getColumn(c);
    if (srcCol.width) wsSc.getColumn(c).width = srcCol.width;
  }
  // Copy header rows 1-10 from ワークフロー
  for (let r = 1; r <= 10; r++) {
    const srcRow = ws.getRow(r);
    const dstRow = wsSc.getRow(r);
    if (srcRow.height) dstRow.height = srcRow.height;
    for (let c = 1; c <= 11; c++) {
      const srcCell = srcRow.getCell(c);
      const dstCell = dstRow.getCell(c);
      if (srcCell.value != null) dstCell.value = srcCell.value;
      if (srcCell.style) dstCell.style = JSON.parse(JSON.stringify(srcCell.style));
    }
    dstRow.commit();
  }
  // Copy merges for rows 1-10
  if (ws.model && Array.isArray(ws.model.merges)) {
    ws.model.merges.forEach(m => {
      const match = m.match(/^[A-Z]+(\d+)/);
      if (match && parseInt(match[1]) <= 10) {
        try { wsSc.mergeCells(m); } catch (_) {}
      }
    });
  }
  // Write SCENARIO data from row 11
  SCENARIO.forEach(([no, daiko, chuko, shoko, cond, user, input, output], idx) => {
    const rowNum = 11 + idx;
    const row = wsSc.getRow(rowNum);
    row.height = anchorHeight;
    const vals = [no, daiko, chuko, shoko, cond, user, input, output, ""];
    vals.forEach((v, i) => {
      const colNum = i + 2;
      const cell = row.getCell(colNum);
      cell.value = (v === "" || v == null) ? null : v;
      if (anchorStyles[colNum]) cell.style = JSON.parse(JSON.stringify(anchorStyles[colNum]));
      if (typeof v === "string" && v.indexOf("\n") !== -1) {
        cell.alignment = Object.assign({}, cell.alignment || {}, { wrapText: true, vertical: "top" });
      }
    });
    row.commit();
  });
  // Merge 大項目 (col C=3) per scenario group
  let scMergeStart = 11;
  for (let i = 1; i <= SCENARIO.length; i++) {
    const diff = i === SCENARIO.length || SCENARIO[i][1] !== SCENARIO[i - 1][1];
    if (diff) {
      const mergeEnd = 10 + i;
      if (mergeEnd > scMergeStart) {
        try { wsSc.mergeCells(scMergeStart, 3, mergeEnd, 3); } catch (_) {}
      }
      if (i < SCENARIO.length) scMergeStart = 11 + i;
    }
  }

  // ===== Add × COUNTIF formula to H5 of both sheets (missing in template) =====
  ws.getRow(5).getCell(8).value = { formula: 'COUNTIF(J:J,"\u00d7")' };
  ws.getRow(5).commit();
  wsSc.getRow(5).getCell(8).value = { formula: 'COUNTIF(J:J,"\u00d7")' };
  wsSc.getRow(5).commit();

  // ===== Update MENU sheet =====
  const wsMENU = wb.getWorksheet("MENU ");
  if (wsMENU) {
    // Update app name (R3, C5-C9)
    for (let c = 5; c <= 9; c++) wsMENU.getRow(3).getCell(c).value = "\u96fb\u8a71\u5de5\u4e8b\u4f9d\u983c\u66f8";
    wsMENU.getRow(3).commit();
    // Add Scenario to sheet list (R6)
    [3, 4, 5].forEach(c => { wsMENU.getRow(6).getCell(c).value = "\u30fb Scenario"; });
    wsMENU.getRow(6).commit();
    // Update count formulas (総テスト数 table = ワークフロー + Scenario)
    const wf = "\u30ef\u30fc\u30af\u30d5\u30ed\u30fc";
    wsMENU.getRow(29).getCell(14).value = { formula: wf + "!H2+Scenario!H2" };  // 総テスト数
    wsMENU.getRow(30).getCell(14).value = { formula: wf + "!H6+Scenario!H6" };  // 未
    wsMENU.getRow(31).getCell(14).value = { formula: wf + "!H3+Scenario!H3" };  // 〇
    wsMENU.getRow(32).getCell(14).value = { formula: wf + "!H4+Scenario!H4" };  // △
    wsMENU.getRow(33).getCell(14).value = { formula: wf + "!H5+Scenario!H5" };  // ×
    for (let r = 29; r <= 33; r++) wsMENU.getRow(r).commit();
  }

  await wb.xlsx.writeFile(OUTPUT);
  console.log("Done:", OUTPUT);
  console.log("TC count:", TC.length);
}

run().catch(e => { console.error(e.message); process.exit(1); });
