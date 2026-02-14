
;; Hive-402: Trustless Payment Splitter
;; Protocol: x402
;; Description: Routes 90% of payment to Agent, 10% to Protocol

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_PAYMENT_FAILED (err u402))
(define-constant ERR_INVALID_AMOUNT (err u400))

;; Data Var: Protocol Wallet (defaults to deployer)
(define-data-var protocol-wallet principal tx-sender)

;; Event: access-granted
;; API listens for this to release the decryption key
(define-read-only (get-protocol-wallet)
  (var-get protocol-wallet)
)

;; Public Function: Pay for Intelligence
;; @param amount: microSTX amount (e.g., 500000 for 0.5 STX)
;; @param provider: The Agent selling the data
;; @param skill-id: The ID of the skill (hashed or numeric mapping)
(define-public (pay-for-access (amount uint) (provider principal) (skill-id (string-utf8 64)))
  (let
    (
      ;; Calculate Split
      (fee (/ amount u10))             ;; 10% Protocol Fee
      (seller-share (- amount fee))    ;; 90% Seller Share
    )
    
    ;; Ensure amount is valid
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)

    ;; 1. Transfer Seller Share (90%)
    (try! (stx-transfer? seller-share tx-sender provider))

    ;; 2. Transfer Protocol Fee (10%)
    (try! (stx-transfer? fee tx-sender (var-get protocol-wallet)))

    ;; 3. Emit Event
    (print {
      event: "access-granted",
      buyer: tx-sender,
      provider: provider,
      skill-id: skill-id,
      amount: amount,
      fee: fee
    })

    (ok true)
  )
)
