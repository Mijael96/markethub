import json
from pathlib import Path


class JsonRepository:

    def __init__(self, data_path: Path):
        self.data_path = data_path


    def get(self, filename: str):
        file_path = self.data_path / filename

        if not file_path.exists():
            raise FileNotFoundError(
                f"Dataset {filename} no encontrado"
            )

        with file_path.open(
            mode="r",
            encoding="utf-8"
        ) as file:
            return json.load(file)