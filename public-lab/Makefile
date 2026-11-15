.PHONY: check package
check:
	python3 release_check.py
	PYTHONPATH=. python3 -m unittest discover -s evaluator -p 'test_*.py' -v
	python3 cases/generate.py --seed 17 --count 12 -o /tmp/phraselab-generated-cases.json

package:
	python3 museum/build_catalog.py
	python3 release_check.py
	python3 package_release.py -o ../phraselab-platform.zip --sha256-output ../phraselab-platform.zip.sha256
