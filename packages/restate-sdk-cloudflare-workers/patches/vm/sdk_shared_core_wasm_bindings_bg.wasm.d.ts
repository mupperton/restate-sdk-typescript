/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export const start: () => void;
export const set_log_level: (a: number) => void;
export const __wbg_wasmheader_free: (a: number, b: number) => void;
export const __wbg_get_wasmheader_key: (a: number) => [number, number];
export const __wbg_get_wasmheader_value: (a: number) => [number, number];
export const wasmheader_new: (a: number, b: number, c: number, d: number) => number;
export const __wbg_wasmresponsehead_free: (a: number, b: number) => void;
export const __wbg_get_wasmresponsehead_status_code: (a: number) => number;
export const __wbg_get_wasmresponsehead_headers: (a: number) => [number, number];
export const __wbg_wasminput_free: (a: number, b: number) => void;
export const __wbg_get_wasminput_headers: (a: number) => [number, number];
export const __wbg_get_wasminput_input: (a: number) => any;
export const __wbg_wasmvm_free: (a: number, b: number) => void;
export const wasmvm_new: (a: number, b: number, c: number, d: number) => [number, number, number];
export const wasmvm_get_response_head: (a: number) => number;
export const wasmvm_notify_input: (a: number, b: number, c: number) => void;
export const wasmvm_notify_input_closed: (a: number) => void;
export const wasmvm_notify_error: (a: number, b: number, c: number, d: number, e: number) => void;
export const wasmvm_take_output: (a: number) => any;
export const wasmvm_is_ready_to_execute: (a: number) => [number, number, number];
export const wasmvm_is_completed: (a: number, b: number) => number;
export const wasmvm_do_progress: (a: number, b: number, c: number) => [number, number, number];
export const wasmvm_take_notification: (a: number, b: number) => [number, number, number];
export const wasmvm_sys_input: (a: number) => [number, number, number];
export const wasmvm_sys_get_state: (a: number, b: number, c: number) => [number, number, number];
export const wasmvm_sys_get_state_keys: (a: number) => [number, number, number];
export const wasmvm_sys_set_state: (a: number, b: number, c: number, d: any) => [number, number];
export const wasmvm_sys_clear_state: (a: number, b: number, c: number) => [number, number];
export const wasmvm_sys_clear_all_state: (a: number) => [number, number];
export const wasmvm_sys_sleep: (a: number, b: bigint) => [number, number, number];
export const wasmvm_sys_call: (a: number, b: number, c: number, d: number, e: number, f: any, g: number, h: number, i: number, j: number) => [number, number, number];
export const wasmvm_sys_send: (a: number, b: number, c: number, d: number, e: number, f: any, g: number, h: number, i: number, j: number, k: number, l: bigint) => [number, number, number];
export const wasmvm_sys_awakeable: (a: number) => [number, number, number];
export const wasmvm_sys_complete_awakeable_success: (a: number, b: number, c: number, d: any) => [number, number];
export const wasmvm_sys_complete_awakeable_failure: (a: number, b: number, c: number, d: any) => [number, number];
export const wasmvm_sys_get_promise: (a: number, b: number, c: number) => [number, number, number];
export const wasmvm_sys_peek_promise: (a: number, b: number, c: number) => [number, number, number];
export const wasmvm_sys_complete_promise_success: (a: number, b: number, c: number, d: any) => [number, number, number];
export const wasmvm_sys_complete_promise_failure: (a: number, b: number, c: number, d: any) => [number, number, number];
export const wasmvm_sys_run: (a: number, b: number, c: number) => [number, number, number];
export const wasmvm_propose_run_completion_success: (a: number, b: number, c: any) => [number, number];
export const wasmvm_propose_run_completion_failure: (a: number, b: number, c: any) => [number, number];
export const wasmvm_propose_run_completion_failure_transient: (a: number, b: number, c: number, d: number, e: number, f: number, g: bigint, h: any) => [number, number];
export const wasmvm_sys_cancel_invocation: (a: number, b: number, c: number) => [number, number];
export const wasmvm_sys_write_output_success: (a: number, b: any) => [number, number];
export const wasmvm_sys_write_output_failure: (a: number, b: any) => [number, number];
export const wasmvm_sys_end: (a: number) => [number, number];
export const wasmvm_is_processing: (a: number) => number;
export const __wbg_wasmidentityverifier_free: (a: number, b: number) => void;
export const wasmidentityverifier_new: (a: number, b: number) => [number, number, number];
export const wasmidentityverifier_verify_identity: (a: number, b: number, c: number, d: number, e: number) => [number, number];
export const cancel_handle: () => number;
export const __wbg_get_wasminput_invocation_id: (a: number) => [number, number];
export const __wbg_get_wasminput_key: (a: number) => [number, number];
export const ring_core_0_17_11__bn_mul_mont: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
export const __wbindgen_malloc: (a: number, b: number) => number;
export const __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
export const __wbindgen_exn_store: (a: number) => void;
export const __externref_table_alloc: () => number;
export const __wbindgen_export_4: WebAssembly.Table;
export const __wbindgen_free: (a: number, b: number, c: number) => void;
export const __externref_drop_slice: (a: number, b: number) => void;
export const __externref_table_dealloc: (a: number) => void;
export const __wbindgen_start: () => void;
