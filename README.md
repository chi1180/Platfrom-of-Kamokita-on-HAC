# Platform of Kamokita on HAC

広島AIクラブ（HAC）向けのサービスをまとめるリポジトリです。

## 概要

Reactベースで開発したサービスをペライチのHTMLに変換し、Babcoでホスティングするプラットフォームです。

## プロジェクト構成

```
babco/
├── platform/     # Reactベースでの開発ディレクトリ
│   └── better-hac/
└── dist/         # ペライチHTML出力ディレクトリ
    ├── project.better-hac.html
    ├── project.index.html
    └── project.ondemand-bus.html
```

## 主な機能

- **ペライチHTML変換**: Reactで作成したサービスをペライチのHTMLに変換

## 技術スタック

- React
