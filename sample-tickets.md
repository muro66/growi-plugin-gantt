# チケットのサンプル

以下の内容を GROWI の **`/tickets` 配下** に新規ページとして作成してください。  
各ページの**本文**をコピーし、ページ作成時に貼り付けて保存します。

---

## 1. ログイン機能の実装

**ページパス**: `/tickets/login-feature`  
**タイトル**: ログイン機能の実装

**本文**:

```ticket-meta
status: In Progress
project: 認証
assignee: 田中
startDate: "2025-03-01"
dueDate: "2025-03-15"
progress: 60
```

認証基盤を用いたログイン画面とセッション管理を実装する。

---

## 2. API 設計

**ページパス**: `/tickets/api-design`  
**タイトル**: API 設計

**本文**:

```ticket-meta
status: Done
project: バックエンド
assignee: 佐藤
startDate: "2025-02-15"
dueDate: "2025-03-05"
progress: 100
```

REST API のエンドポイント設計と OpenAPI ドキュメント作成。

---

## 3. ダッシュボード画面

**ページパス**: `/tickets/dashboard-ui`  
**タイトル**: ダッシュボード画面

**本文**:

```ticket-meta
status: New
project: フロントエンド
assignee: 鈴木
startDate: "2025-03-10"
dueDate: "2025-03-25"
progress: 0
```

トップページのダッシュボードレイアウトとウィジェット配置。

---

## 4. 単体テスト追加

**ページパス**: `/tickets/unit-tests`  
**タイトル**: 単体テスト追加

**本文**:

```ticket-meta
status: In Progress
project: バックエンド
assignee: 佐藤
startDate: "2025-03-05"
dueDate: "2025-03-20"
progress: 40
```

主要モジュールの単体テストと CI 組み込み。

---

## 5. ドキュメント整備

**ページパス**: `/tickets/docs`  
**タイトル**: ドキュメント整備

**本文**:

```ticket-meta
status: New
project: ドキュメント
assignee: ""
startDate: "2025-03-15"
dueDate: "2025-03-31"
progress: 0
```

開発者向け README と API 利用ガイドの整備。

---

## 6. 検索機能

**ページパス**: `/tickets/search-feature`  
**タイトル**: 検索機能

**本文**:

```ticket-meta
status: New
project: フロントエンド
assignee: 鈴木
startDate: "2025-03-20"
dueDate: "2025-04-10"
progress: 0
```

全文検索 UI とフィルタの実装。

---

## 使い方

1. GROWI で **「📊 チケット・ガント」** パネルを開く。
2. **「＋ 新規チケット」** で `/tickets/new` を開くか、`/tickets` の子ページとして上記のパスでページを作成。
3. **タイトル** と **本文**（`ticket-meta` ブロックを含む）を貼り付けて保存。
4. チケット一覧・ガントタブで表示を確認。**カード**表示では Project ごとにグループ化され、ドラッグで Project を変更できます。
