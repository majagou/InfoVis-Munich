import csv

input_file = r'C:\Users\gouma\IV Project\Team-28\stops.txt'
output_file = 'output.csv'

with open(input_file, 'r') as infile, open(output_file, 'w', newline='') as outfile:
    reader = csv.reader(infile, delimiter='\t')  # Update delimiter if needed
    writer = csv.writer(outfile)

    for row in reader:
        writer.writerow(row)
