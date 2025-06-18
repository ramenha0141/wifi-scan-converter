# wifi-scan-converter

macOSのワイヤレス診断を使用して生成されたレポートを `bssid`, `rssi` のみのCSVファイルに変換します

## ダウンロード方法

[最新のリリース](https://github.com/ramenha0141/wifi-scan-converter/releases/latest)から`main.js`をダウンロード

## 使用方法

任意の [Node.js](https://nodejs.org/ja) 環境で以下のコマンドを実行すると現在のワーキングディレクトリにCSVファイルが出力されます：

```sh
$ node ./main.js
```

> [!NOTE]
> `./main.js` はダウンロードしたファイルのパスに置き換えてください

## 備考

macOSの言語が日本語以外に設定されている場合はファイルを取得できません