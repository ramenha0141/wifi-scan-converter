import { globSync, mkdtempSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { gunzipSync } from 'node:zlib';

import { extract } from 'tar';

const tempDir = mkdtempSync(join(tmpdir(), 'wifi-scan-'));
const paths = globSync('/var/tmp/ワイヤレス診断_*_*-*-*_*.*.*.tar.gz');

for (const path of paths) {
    try {
        console.log(`処理中: ${path}`);

        const compressedData = readFileSync(path);

        const decompressedData = gunzipSync(compressedData);

        const tempTarFile = join(tempDir, 'temp.tar');

        try {
            writeFileSync(tempTarFile, decompressedData);

            // tar を同期的に展開
            extract({
                sync: true,
                file: tempTarFile,
                cwd: tempDir,
                filter: (path) => path.endsWith('wifi_scan.txt')
            });

            // wifi_scan.txt を探して読み取り
            const extractedFiles = globSync(join(tempDir, '**/wifi_scan.txt'));

            if (extractedFiles.length > 0) {
                const wifiScanPath = extractedFiles[0];

                const wifiScanContent = readFileSync(wifiScanPath, 'utf8');

                const rows = wifiScanContent
                    .split('\n')
                    .slice(1)
                    .map((line) => {
                        const columns = line.split(',').map((column) => column.trim());

                        const bssid = columns
                            .find((column) => column.startsWith('bssid='))
                            ?.replace('bssid=', '');
                        const rssi = columns
                            .find((column) => column.startsWith('rssi='))
                            ?.replace('rssi=', '');

                        if (bssid && rssi) {
                            return { bssid, rssi };
                        }
                    })
                    .filter((row) => !!row);

                const filename = `${basename(path, '.tar.gz')}.csv`;

                writeFileSync(
                    join(process.cwd(), filename),
                    rows.map((row) => `${row.bssid},${row.rssi}`).join('\n')
                );
            } else {
                console.log('wifi_scan.txt が見つかりませんでした');
            }
        } finally {
            // 一時ファイルを削除
            try {
                unlinkSync(tempTarFile);
                // 展開されたファイルも削除
                const allFiles = globSync(join(tempDir, '**/*'));
                for (const file of allFiles) {
                    try {
                        unlinkSync(file);
                    } catch (_) {}
                }
            } catch (_) {}
        }
    } catch (error) {
        console.error(`エラーが発生しました (${path}):`, error);
    }
}
